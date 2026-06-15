import { exec } from 'child_process';
import os from 'os';

export interface IcmpCheckResult {
  reachable: boolean;
  responseTime: number | null;
  packetLoss: number | null;
  message: string | null;
}

export const icmpCheck = (host: string, timeoutSeconds: number = 5): Promise<IcmpCheckResult> => {
  return new Promise((resolve) => {
    const isWindows = os.platform() === 'win32';

    // -c 3 = 3 pacotes (Linux/mac), -n 3 (Windows)
    // -W timeout em segundos (Linux), -w timeout em ms (Windows)
    const command = isWindows
      ? `ping -n 3 -w ${timeoutSeconds * 1000} ${host}`
      : `ping -c 3 -W ${timeoutSeconds} ${host}`;

    const start = Date.now();

    exec(command, { timeout: (timeoutSeconds + 2) * 1000 }, (error, stdout) => {
      const responseTime = Date.now() - start;

      if (error) {
        resolve({
          reachable: false,
          responseTime: null,
          packetLoss: 100,
          message: `Host unreachable: ${error.message}`
        });
        return;
      }

      // extrair packet loss da saída do ping
      const packetLossMatch = stdout.match(/(\d+)%\s+packet loss/i);
      const packetLoss = packetLossMatch ? parseInt(packetLossMatch[1], 10) : null;

      // extrair tempo médio de resposta
      const rttMatch = stdout.match(/(?:avg|mean)[^=]*=\s*[\d.]+\/([\d.]+)/i) ||
                       stdout.match(/Average\s*=\s*([\d.]+)/i);
      const avgRtt = rttMatch ? Math.round(parseFloat(rttMatch[1])) : responseTime;

      const reachable = packetLoss !== null ? packetLoss < 100 : !error;

      resolve({
        reachable,
        responseTime: reachable ? avgRtt : null,
        packetLoss: packetLoss ?? (reachable ? 0 : 100),
        message: reachable ? null : `Packet loss: ${packetLoss}%`
      });
    });
  });
};