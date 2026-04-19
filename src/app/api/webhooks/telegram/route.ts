export async function POST(request: Request) {
  const body = await request.json()
  console.log("Telegram webhook received:", body)
  return Response.json({ ok: true })
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const challenge = url.searchParams.get("hub.challenge")

  if (challenge) {
    return new Response(challenge, { status: 200 })
  }

  return Response.json({ ok: false }, { status: 400 })
}
