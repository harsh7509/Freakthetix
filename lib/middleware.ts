import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
      if (!isAdminRoute) return true;
      return token?.role === "admin";
    },
  },
});

export const config = { 
  matcher: ["/admin/:path*", "/api/orders"],
};
