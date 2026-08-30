import { Container } from "@/components/layout/Container";
import { LatestBlog } from "@/components/home/LatestBlog";

export default function BlogListPage() {
  return (
    <div className="py-8">
      <Container>
        <LatestBlog />
      </Container>
    </div>
  );
}
