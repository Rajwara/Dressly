export default function TextPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="wrap narrow">
      <h1 style={{ marginBottom: 20 }}>{title}</h1>
      {children}
    </div>
  );
}
