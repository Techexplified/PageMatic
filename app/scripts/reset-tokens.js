// Usage - node app/scripts/reset-tokens.js your-store.myshopify.com

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main(){
    const args = process.argv.slice(2).filter(Boolean);
    const shop = args[0];

    if(args.length !== 1 || !shop || !shop.includes("myshopify.com")){
        console.error("Invalid shopify store name or too many arguments");
        process.exit(1);
    }

    const shopsettings = await db.shopSettings.findUnique({
        where: {shop:shop},
    });

    if(!shopsettings){
        console.error("Not an authorized store");
        process.exit(1);
    }

    const goldCredits = 100;
    const silverCredits = 200;

    const updated = await db.shopSettings.update({
        where: {shop:shop},
        data:{
            pageCredits: goldCredits,
            iterationTokens: silverCredits,
        }
    })

    if(updated){
        console.log(`Successfully reset tokens for ${shop}`);
        process.exit(0);
    }else{
        console.error("Failed to Reset tokens");
        process.exit(1);
    }

}

main()
    .finally(async()=> await db.$disconnect());