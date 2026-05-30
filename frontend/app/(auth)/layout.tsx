export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-theme="light" className="contents">
      {children}
    </div>
  );
}
