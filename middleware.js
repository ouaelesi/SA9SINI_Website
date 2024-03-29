import { NextResponse, NextRequest } from "next/server";
const secret = "secret";
import * as jose from "jose";

export async function middleware(req, res) {
  const { cookies } = req;
  const jwt = cookies.get("OursiteJWT");

  const { pathname, origin } = req.nextUrl;

  if (pathname.includes("/logIn") || pathname.includes("/signUp")) {
    if (jwt) {
      try {
        // verify(jwt, secret);
        // const { payload: jwtData } = await jose.jwtVerify(
        //   jwt,
        //   new TextEncoder().encode(`secret`)
        // );
        return NextResponse.redirect(`${origin}/`);
      } catch (err) {
        return NextResponse.next();
      }
    }
  }

  if (pathname.includes("/Profil") || pathname.includes("/askQuestion")) {
    if (jwt === undefined) {
      return NextResponse.redirect(`${origin}/logIn`);
    }
    try {
      // verify(jwt, secret);
      // const { payload: jwtData } = await jose.jwtVerify(
      //   jwt,
      //   new TextEncoder().encode(`secret`)
      // );
      return NextResponse.next();
    } catch (err) {
      return NextResponse.redirect(`${origin}/logIn`);
    }
  }
}
