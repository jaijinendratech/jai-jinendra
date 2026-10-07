import { config } from "dotenv"; import { createClient } from "@supabase/supabase-js";
config({path:".env"});
const s=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!);
(async()=>{
const {data:def}=await s.from("attribute_definitions").select("id").eq("key","best_paired_with").single();
const keep=new Set(((await s.from("product_attribute_values").select("product_id").eq("attribute_id",def!.id)).data as any[]).map(x=>x.product_id));
const prods=(await s.from("products").select("id,name,categories(slug),product_variants(id)")).data as any[];
const del=prods.filter(p=>!keep.has(p.id));
console.log("keep",keep.size,"delete",del.length);
const c:Record<string,number>={};del.forEach(p=>c[p.categories?.slug]=(c[p.categories?.slug]??0)+1);console.log(c);
const vids=del.flatMap(p=>p.product_variants.map((v:any)=>v.id));
const oi=(await s.from("order_items").select("id,product_id,variant_id").in("variant_id",vids)).data as any[];
const oi2=(await s.from("order_items").select("id,product_id").in("product_id",del.map(p=>p.id))).data as any[];
console.log("order_items refs",oi?.length,oi2?.length, [...new Set(oi2.map(x=>del.find(p=>p.id===x.product_id)?.name))]);
if(process.argv.includes("--apply")){
 const blocked=new Set(oi2.map(x=>x.product_id));
 const ids=del.filter(p=>!blocked.has(p.id)).map(p=>p.id);
 const r=await s.from("products").delete({count:"exact"}).in("id",ids);console.log("deleted",r.count,r.error?.message);
 const b=del.filter(p=>blocked.has(p.id)).map(p=>p.id);
 if(b.length){const u=await s.from("products").update({published:false}).in("id",b);console.log("unpublished (have orders)",b.length,u.error?.message);}
}})();
