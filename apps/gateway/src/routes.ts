export const ROUTES = [
  {
    url: "/auth",
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 25, // limit each IP to 5 requests per windowMs
    },
    proxy: {
      target: "http://localhost:8080",
      changeOrigin: false,
      allowMethods: ["GET", "POST", "PUT", "DELETE"],
      origin: "http://localhost:9000",
      onProxyReq: (proxyReq: any, req: any, res: any) => {
        proxyReq.setHeader("origin", "http://localhost:9000");
      },
    },
  },
];
