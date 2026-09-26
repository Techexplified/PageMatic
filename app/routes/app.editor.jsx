import { useState, useEffect } from "react";
import { useLoaderData, useFetcher, data } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { generateWithGroq } from "../services/groq.server";

// Studio Editor Sub-components
import EditorHeader from "../components/editor/EditorHeader";
import EditorLayersPanel from "../components/editor/EditorLayersPanel";
import EditorPreviewCanvas from "../components/editor/EditorPreviewCanvas";
import EditorInspectorPanel from "../components/editor/EditorInspectorPanel";
import "../styles/editor.css";

// ============================================================================
// LOADER (Fetches shop settings and initial page state)
// ============================================================================
export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const pageId = url.searchParams.get("pageId");

  const shopSettings = await db.shopSettings.findUnique({
    where: { shop: session.shop },
  });

  let page = null;
  if (pageId && !pageId.startsWith("temp")) {
    page = await db.page.findUnique({
      where: { id: pageId },
    });
  }

  return data({
    page,
    shopSettings,
  });
};

// ============================================================================
// ACTION (Handles AI Micro-Edits & Section Re-rolls via Groq)
// ============================================================================
export const action = async ({ request }) => {
  await authenticate.admin(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "REROLL_SECTION") {
    const sectionType = formData.get("sectionType");
    const currentDataStr = formData.get("currentData");
    const prompt = formData.get("prompt") || "Improve and polish this section copy for higher conversion.";

    let currentData = {};
    try {
      if (currentDataStr) currentData = JSON.parse(currentDataStr);
    } catch (e) {}

    const systemPrompt = `You are PageMatic AI. You specialize in micro-editing single landing page sections.
Return ONLY a valid JSON object matching the data schema for section type: ${sectionType}.
Do not output markdown backticks or conversational text.`;

    const userPrompt = `Modify and regenerate this ${sectionType} section based on this instruction:
"${prompt}"

CURRENT SECTION DATA:
${JSON.stringify(currentData, null, 2)}

Return the updated data JSON object:`;

    try {
      // Try Groq for sub-second re-roll; if no key, return modified local data
      let updatedData;
      if (process.env.GROQ_API_KEY) {
        updatedData = await generateWithGroq({ systemPrompt, userPrompt });
      } else {
        // Fallback demo tweak
        updatedData = {
          ...currentData,
          headline: currentData.headline ? `✨ ${currentData.headline}` : undefined,
          heading: currentData.heading ? `✨ ${currentData.heading}` : undefined,
        };
      }

      return data({ success: true, updatedData });
    } catch (err) {
      console.error("Groq re-roll error:", err);
      return data({ success: false, error: err.message }, { status: 400 });
    }
  }

  return data({ success: true });
};

// ============================================================================
// STUDIO EDITOR MASTER COMPONENT
// ============================================================================
export default function StudioEditor() {
  const { page: loaderPage, shopSettings } = useLoaderData();
  const fetcher = useFetcher();

  // In-Memory / Loaded Page State
  const [page, setPage] = useState(loaderPage || null);
  const [pageTitle, setPageTitle] = useState("");
  const [deviceMode, setDeviceMode] = useState("desktop"); // desktop | tablet | mobile
  const [selectedSectionId, setSelectedSectionId] = useState(null);

  // Initialize from sessionStorage or loader on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("pagematic_generated_page");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.contentJson) {
            setPage(parsed);
            setPageTitle(parsed.title || "Untitled Page");
            if (parsed.contentJson.sections?.length > 0) {
              setSelectedSectionId(parsed.contentJson.sections[0].id);
            }
            return;
          }
        } catch (e) {
          console.warn("Session storage parse warning:", e);
        }
      }
    }

    if (loaderPage) {
      setPage(loaderPage);
      setPageTitle(loaderPage.title || "Untitled Page");
      if (loaderPage.contentJson?.sections?.length > 0) {
        setSelectedSectionId(loaderPage.contentJson.sections[0].id);
      }
    }
  }, [loaderPage]);

  // Handle Groq Re-roll action response
  useEffect(() => {
    if (fetcher.data?.success && fetcher.data?.updatedData && selectedSectionId) {
      handleUpdateSectionData(selectedSectionId, fetcher.data.updatedData);
    }
  }, [fetcher.data]);

  const contentJson = page?.contentJson || { sections: [], themeTokens: {} };
  const sections = contentJson.sections || [];
  const themeTokens = contentJson.themeTokens || {};

  const selectedSection = sections.find((s) => s.id === selectedSectionId) || sections[0];

  // 1. Toggle Section Visibility (Hide/Show)
  const handleToggleVisibility = (sectionId) => {
    const updatedSections = sections.map((sec) => {
      if (sec.id === sectionId) {
        return { ...sec, visible: sec.visible === false ? true : false };
      }
      return sec;
    });
    updateSectionsInState(updatedSections);
  };

  // 2. Reorder Sections
  const handleMoveSection = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= sections.length) return;
    const updated = [...sections];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    updateSectionsInState(updated);
  };

  // 3. Delete Section
  const handleDeleteSection = (sectionId) => {
    const updated = sections.filter((s) => s.id !== sectionId);
    updateSectionsInState(updated);
    if (selectedSectionId === sectionId && updated.length > 0) {
      setSelectedSectionId(updated[0].id);
    }
  };

  // 4. Add Section
  const handleAddSection = () => {
    const newSec = {
      id: `sec_custom_${Date.now()}`,
      type: "BENEFITS",
      visible: true,
      data: {
        heading: "New Custom Section",
        subtitle: "Add your key value propositions here.",
        items: [
          { title: "Point 1", description: "Highlight your key feature." },
          { title: "Point 2", description: "Another conversion driver." },
        ],
      },
    };
    const updated = [...sections, newSec];
    updateSectionsInState(updated);
    setSelectedSectionId(newSec.id);
  };

  // 5. Update Section Data (from Inspector inputs)
  const handleUpdateSectionData = (sectionId, newData) => {
    const updated = sections.map((sec) => {
      if (sec.id === sectionId) {
        return { ...sec, data: newData };
      }
      return sec;
    });
    updateSectionsInState(updated);
  };

  // 6. Trigger AI Section Re-Roll
  const handleAiReRoll = (section, prompt) => {
    const formData = new FormData();
    formData.append("intent", "REROLL_SECTION");
    formData.append("sectionType", section.type);
    formData.append("currentData", JSON.stringify(section.data || {}));
    formData.append("prompt", prompt);

    fetcher.submit(formData, { method: "POST" });
  };

  // Helper to commit state & sync to storage + BroadcastChannel
  const updateSectionsInState = (newSections) => {
    const updatedContent = {
      ...contentJson,
      sections: newSections,
    };
    const updatedPage = {
      ...page,
      title: pageTitle,
      contentJson: updatedContent,
    };
    setPage(updatedPage);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("pagematic_generated_page", JSON.stringify(updatedPage));
      localStorage.setItem("pagematic_live_preview", JSON.stringify(updatedPage));

      // Broadcast live changes to any open preview tab
      if ("BroadcastChannel" in window) {
        const bc = new BroadcastChannel("pagematic_preview_sync");
        bc.postMessage({ type: "PAGEMATIC_PREVIEW_UPDATE", page: updatedPage });
        bc.close();
      }
    }
  };

  // 7. Save Draft
  const handleSave = () => {
    if (typeof window !== "undefined") {
      const payload = { ...page, title: pageTitle, contentJson };
      sessionStorage.setItem("pagematic_generated_page", JSON.stringify(payload));
      localStorage.setItem("pagematic_live_preview", JSON.stringify(payload));
    }
  };

  // 8. Standalone Sandboxed Live Preview in New Tab (Zero Shopify store pollution)
  const handlePreview = () => {
    if (typeof window !== "undefined") {
      const payload = { ...page, title: pageTitle, contentJson };
      localStorage.setItem("pagematic_live_preview", JSON.stringify(payload));
      window.open("/preview", "_blank");
    }
  };

  // 9. Publish (Milestone 4 placeholder)
  const handlePublish = () => {
    alert(`Ready for Milestone 4! Publishing "${pageTitle}" directly to your Shopify Online Store.`);
  };

  if (!page) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "Inter, sans-serif" }}>
        <p style={{ color: "#64748B" }}>Loading Studio Editor...</p>
      </div>
    );
  }

  return (
    <div className="pm-editor-root">
      {/* Top Header */}
      <EditorHeader
        pageTitle={pageTitle}
        setPageTitle={(title) => {
          setPageTitle(title);
          updateSectionsInState(sections);
        }}
        pageStatus={page.status || "DRAFT"}
        deviceMode={deviceMode}
        setDeviceMode={setDeviceMode}
        onSave={handleSave}
        onPreview={handlePreview}
        onPublish={handlePublish}
        isSaving={fetcher.state === "submitting"}
      />

      {/* 3-Column Body */}
      <div className="pm-editor-body">
        {/* Left Column: Layers Panel */}
        <EditorLayersPanel
          sections={sections}
          selectedSectionId={selectedSectionId}
          setSelectedSectionId={setSelectedSectionId}
          onToggleVisibility={handleToggleVisibility}
          onMoveSection={handleMoveSection}
          onDeleteSection={handleDeleteSection}
          onAddSection={handleAddSection}
        />

        {/* Center Column: Live Responsive Canvas */}
        <EditorPreviewCanvas
          sections={sections}
          themeTokens={themeTokens}
          selectedSectionId={selectedSectionId}
          setSelectedSectionId={setSelectedSectionId}
          deviceMode={deviceMode}
        />

        {/* Right Column: Dynamic Inspector Panel */}
        <EditorInspectorPanel
          selectedSection={selectedSection}
          onUpdateSectionData={handleUpdateSectionData}
          onAiReRoll={handleAiReRoll}
          isReRolling={fetcher.state === "submitting"}
        />
      </div>
    </div>
  );
}
