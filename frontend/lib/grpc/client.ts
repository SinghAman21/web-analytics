import path from 'path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

export const GRPC_HOST = process.env.GRPC_HOST || '127.0.0.1';
export const GRPC_PORT = Number(process.env.GRPC_PORT || 50051);

const PROTO_PATH = path.join(process.cwd(), 'proto', 'analytics.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);

const analyticsPackage = protoDescriptor['analytics'] as {
  AnalyticsService: grpc.ServiceClientConstructor;
};

let client: grpc.Client | undefined;

export function getGrpcClient(): grpc.Client {
  if (!client) {
    const ctor = analyticsPackage.AnalyticsService;
    client = new ctor(`${GRPC_HOST}:${GRPC_PORT}`, grpc.credentials.createInsecure());
  }
  return client;
}

export function closeGrpcClient(): void {
  if (client) {
    client.close();
    client = undefined;
  }
}

type UnaryMethod<TReq, TResp> = (
  request: TReq,
  options: { deadline: Date },
  callback: (err: grpc.ServiceError | null, response: TResp | null) => void,
) => void;

export function callUnary<TReq, TResp>(
  method: string,
  request: TReq,
  timeoutMs = 30_000,
): Promise<TResp> {
  const c = getGrpcClient() as grpc.Client & Record<string, UnaryMethod<TReq, TResp>>;
  return new Promise((resolve, reject) => {
    const deadline = new Date(Date.now() + timeoutMs);
    c[method](request, { deadline }, (err, response) => {
      if (err) {
        reject(err);
        return;
      }
      if (response === null) {
        reject(new Error('Empty gRPC response'));
        return;
      }
      resolve(response);
    });
  });
}
