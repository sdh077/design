import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
} from "@workspace/ui";

export default function DesignSystemPage() {
  return (
    <main className="min-h-screen bg-background p-8 text-foreground">
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <section className="space-y-2">
          <h1 className="text-3xl font-bold">Design System</h1>
          <p className="text-muted-foreground">
            포트폴리오 전반에 사용하는 공통 UI 컴포넌트를 정리한 페이지입니다.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Buttons</h2>
          <div className="flex flex-wrap gap-3">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Badges</h2>
          <div className="flex flex-wrap gap-3">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Inputs</h2>
          <div className="max-w-sm">
            <Input placeholder="이메일을 입력하세요" />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Card</h2>
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Project Card Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                디자인 시스템 컴포넌트를 조합해 실제 서비스 UI를 구성할 수 있습니다.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}