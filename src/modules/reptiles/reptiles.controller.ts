import { MuscieServer } from "./reptiles.service";
import { Controller, GET, Query, Ctx } from "@bylive/router";

@Controller("reptiles")
export class ReptilesController {
  constructor(private muscieServer: MuscieServer) {}

  @GET()
  async index(@Ctx() ctx: any, @Query("keyword") keyword: string) {
    let data = await this.muscieServer.init(keyword);
    ctx.render("index", { title: JSON.stringify(data) });
  }
}
