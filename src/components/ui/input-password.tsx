import { useState, type ComponentProps } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type Props = Omit<ComponentProps<typeof Input>, 'type'>;

export function InputPassword({ className, ...props }: Props) {
  const [mostrar, setMostrar] = useState(false);

  return (
    <div className="relative">
      <Input type={mostrar ? 'text' : 'password'} className={cn('pr-10', className)} {...props} />
      <button
        type="button"
        onClick={() => setMostrar((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        tabIndex={-1}
      >
        {mostrar ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
