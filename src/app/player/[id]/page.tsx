import Player from "@/components/Player";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <Player id={(await params).id} />;
}
