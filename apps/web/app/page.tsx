import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@workspace/ui";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background p-8 text-foreground">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <Badge variant="secondary" className="w-fit">
          Design System Portfolio
        </Badge>

        <Card>
          <CardHeader>
            <CardTitle>대호의 포트폴리오</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              shadcn 기반 컴포넌트를 monorepo의 ui 패키지로 분리해서 관리하고 있습니다.
            </p>
            <div className="flex gap-3">
              <Button>Primary Button</Button>
              <Button variant="outline">Outline Button</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}