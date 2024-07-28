
interface IAppConfig {
    APP_PORT:number,
    APP_Upload_Dir:string,
    APP_Static_Dir:string
    [key:string]:any
}


export const AppConfig:IAppConfig = {
    APP_PORT:Number(process.env.APP_PORT),
    APP_Upload_Dir:process.env.APP_Upload_Dir,
    APP_Static_Dir:process.env.APP_Static_Dir
}

