import net from 'net';

export interface TcpCheckResult {
  reachable: boolean;
  responseTime: number | null;
  message: string | null;
}

export const tcpCheck = (
  host: string,
  port: number,
  timeoutMs: number = 5000
): Promise<TcpCheckResult> => {
  return new Promise((resolve) => {
    const start = Date.now();
    const socket = new net.Socket();

    const cleanup = () => {
      socket.destroy();
    };

    socket.setTimeout(timeoutMs);

    socket.on('connect', () => {
      const responseTime = Date.now() - start;
      cleanup();
      resolve({ reachable: true, responseTime, message: null });
    });

    socket.on('timeout', () => {
      cleanup();
      resolve({
        reachable: false,
        responseTime: null,
        message: `Connection timed out after ${timeoutMs}ms`
      });
    });

    socket.on('error', (err) => {
      cleanup();
      resolve({
        reachable: false,
        responseTime: null,
        message: err.message
      });
    });

    socket.connect(port, host);
  });
};