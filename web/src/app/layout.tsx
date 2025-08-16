import './globals.css';
export const metadata = {
  title: "Resume Builder AI",
  description: "Create your professional resume in minutes",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 font-sans">{children}</body>
    </html>
  );
}
