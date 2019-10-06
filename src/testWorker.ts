const context: Worker = self as any;

context.addEventListener("message", async (evt)=>{
    console.log("worker work!", evt);
})