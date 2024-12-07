import { AuthProvider } from "@/providers/AuthProvider";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          {children}
          <Toaster 
            position="top-center"
            expand={true}
            toastOptions={{
              style: { 
                background: 'white',
                color: 'black',
                border: '1px solid #e2e8f0'
              }
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
