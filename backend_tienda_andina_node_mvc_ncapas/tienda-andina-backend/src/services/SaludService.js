import { SaludRepository } from '../repositories/SaludRepository.js';
export class SaludService {
  static async check() { await SaludRepository.checkDatabase(); return {estado:'ok',baseDeDatos:'conectada'}; }
}
