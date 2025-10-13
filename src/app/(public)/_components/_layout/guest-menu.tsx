'use client';

import { LogIn, Moon, Sun, User } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { SignInModal } from '@/components/signin-modal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function GuestMenu() {
  const { theme, setTheme } = useTheme();
  const [showSignInModal, setShowSignInModal] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleSignInClick = () => {
    setShowSignInModal(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button aria-label="Menú de opciones" size="icon" variant="outline">
            <User className="h-5 w-5" />
            <span className="sr-only">Menú de opciones</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Opciones</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignInClick}>
            <LogIn className="mr-2 h-4 w-4" />
            <span>Iniciar Sesión</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
            <span>Cambiar a {theme === 'dark' ? 'Claro' : 'Oscuro'}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SignInModal onOpenChange={setShowSignInModal} open={showSignInModal} />
    </>
  );
}
