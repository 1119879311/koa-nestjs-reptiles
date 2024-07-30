


import {
  Controller,
  GET,
  Query,
  Ctx,
  Guard,
  Pipe,
  IContextOption,
  IGuard,
  Use,
  setMetadata,
  Cookie,
} from "@bylive/router";

@Controller("adminConsole")
export class AdminController {

  
  @GET()
   async index(@Ctx() ctx: any,@Query('keyword') keyword: string) {
    // <script type="module" crossorigin src="assets/index.1cdee427.js"></script>
    // <link rel="stylesheet" href="assets/index.403648fe.css">
    ctx.render("admin", { 
        //  js:[{src:"/microapp/user/assets/index.1cdee427.js",type:"module", crossorigin:true}],
        //  css:['/microapp/user/assets/index.403648fe.css']
        js:[{src:"/microapp/admin/assets/index-QN0rYQJi.js",type:"module", crossorigin:true}],
        css:["/microapp/admin/assets/index-DkaQAHBd.css"]
    });
  }
}
