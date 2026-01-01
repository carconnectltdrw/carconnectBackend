export async function POST(req:Request){
  const { username,password } = await req.json()

  if(
    username===process.env.ADMIN_USERNAME &&
    password===process.env.ADMIN_PASSWORD
  ) return Response.json({ ok:true })

  return new Response("Unauthorized",{status:401})
}
