import { IContextArg, IContextOption, Pipe } from '@bylive/router';

// 管道：参数的转换，设置默认值，校验
export class ValidationPip extends Pipe {
  apply(data:Array<IContextArg>,option:IContextOption): void | Promise<void> {
    console.log('管道 Validation-apply:', option.getArgs());
    //  throw new Error("管道 Validation-apply: 参数有误")
  }
}
