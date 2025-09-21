import { TextClassContext } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { Platform, Pressable } from 'react-native';

const buttonVariants = cva(
  cn(
    'group shrink-0 flex-row items-center justify-center gap-2 rounded-md shadow-none border-0',
    Platform.select({
      web: "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive whitespace-nowrap outline-none transition-all focus-visible:ring-[3px] disabled:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
    })
  ),
  {
    variants: {
      variant: {
        default: cn('bg-blue-800 active:bg-blue-700', Platform.select({ web: 'hover:bg-blue-700 shadow-black/5' })),
        destructive: cn(
          'bg-destructive active:bg-destructive/90',
          Platform.select({
            web: 'hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 shadow-black/5',
          })
        ),
        outline: cn(
          'border border-black/5 bg-white active:bg-accent',
          Platform.select({
            web: 'hover:bg-accent dark:hover:bg-accent/50 shadow-black/5',
          })
        ),
        secondary: cn(
          'bg-white border-blue-800 border text-blue-800 active:bg-blue-50',
          Platform.select({ web: 'hover:bg-blue-50 shadow-black/5' })
        ),
        ghost: cn('active:bg-accent', Platform.select({ web: 'hover:bg-accent dark:hover:bg-accent/50' })),
        link: '',
      },
      size: {
        default: cn('h-10 px-4 py-2 sm:h-9', Platform.select({ web: 'has-[>svg]:px-3' })),
        sm: cn('h-9 gap-1.5 rounded-md px-3 sm:h-8', Platform.select({ web: 'has-[>svg]:px-2.5' })),
        lg: cn('h-11 rounded-md px-6 sm:h-10', Platform.select({ web: 'has-[>svg]:px-4' })),
        icon: 'h-10 w-10 sm:h-9 sm:w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const buttonTextVariants = cva(
  cn('text-sm font-medium', Platform.select({ web: 'pointer-events-none transition-colors' })),
  {
    variants: {
      variant: {
        default: 'text-white',
        destructive: 'text-destructive-foreground',
        outline: cn(
          'text-foreground group-active:text-accent-foreground',
          Platform.select({ web: 'group-hover:text-accent-foreground' })
        ),
        secondary: 'text-blue-800',
        ghost: cn(
          'text-foreground group-active:text-accent-foreground',
          Platform.select({ web: 'group-hover:text-accent-foreground' })
        ),
        link: cn(
          'text-primary group-active:text-primary/80',
          Platform.select({
            web: 'underline-offset-4 hover:underline group-hover:underline group-hover:text-primary/80',
          })
        ),
      },
      size: {
        default: '',
        sm: '',
        lg: '',
        icon: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

type ButtonProps = React.ComponentProps<typeof Pressable> &
  React.RefAttributes<typeof Pressable> &
  VariantProps<typeof buttonVariants>;

function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <TextClassContext.Provider value={buttonTextVariants({ variant, size })}>
      <Pressable
        className={cn(props.disabled && 'opacity-50 pointer-events-none', buttonVariants({ variant, size }), className)}
        role='button'
        {...props}
      />
    </TextClassContext.Provider>
  );
}

export { Button, buttonTextVariants, buttonVariants };
export type { ButtonProps };
