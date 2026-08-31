export default async function handler(req,res){
  const fs=require('fs');
  const path=require('path');
  try{
    const file=path.join(process.cwd(),'sellb2.js');
    let code=fs.readFileSync(file,'utf8');
    code=code.replace(/\bfunction\s+top\s*\(/g,'function appTop(');
    code=code.replace(/\btop\(\)/g,'appTop()');
    res.statusCode=200;
    res.setHeader('Content-Type','application/javascript; charset=utf-8');
    res.setHeader('Cache-Control','no-store');
    res.end(code);
  }catch(e){
    res.statusCode=500;
    res.setHeader('Content-Type','application/javascript; charset=utf-8');
    res.end(`throw new Error(${JSON.stringify('SELLB2 script proxy failed: '+e.message)})`);
  }
}
