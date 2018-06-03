import { Controller, Get, Authorization, Before, After, Post } from "../../../lib";
import { IRequestArguments } from '../../../lib/interfaces';
import { ConfigProvider } from '../../../lib/helpers';

@Authorization()
@Controller('with-auth')
export class ControllerWithAuth {
  constructor() {}
  
}
