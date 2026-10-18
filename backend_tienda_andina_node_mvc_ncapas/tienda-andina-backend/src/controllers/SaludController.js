import { SaludService } from '../services/SaludService.js';
export class SaludController {
  static async check(_req,res){res.json(await SaludService.check());}
}
