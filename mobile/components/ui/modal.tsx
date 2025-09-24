import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import * as DialogPrimitive from '@rn-primitives/dialog';
import { X } from 'lucide-react-native';
import * as React from 'react';
import { Platform, Text, View, type ViewProps } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInUp, SlideOutDown } from 'react-native-reanimated';
import { FullWindowOverlay as RNFullWindowOverlay } from 'react-native-screens';

const Modal = DialogPrimitive.Root;
const ModalTrigger = DialogPrimitive.Trigger;
const ModalPortal = DialogPrimitive.Portal;
const ModalClose = DialogPrimitive.Close;

const FullWindowOverlay = Platform.OS === 'ios' ? RNFullWindowOverlay : React.Fragment;

// Enhanced animated wrapper with better animations
function AnimatedModalView({ entering, exiting, ...props }: any) {
  if (Platform.OS === 'web') {
    return <View {...props} />;
  }
  const AnimatedView = Animated.View as any;
  return <AnimatedView entering={entering} exiting={exiting} {...props} />;
}

function ModalOverlay({
  className,
  children,
  ...props
}: Omit<DialogPrimitive.OverlayProps, 'asChild'> &
  React.RefAttributes<DialogPrimitive.OverlayRef> & {
    children?: React.ReactNode;
  }) {
  return (
    <FullWindowOverlay>
      <DialogPrimitive.Overlay
        className={cn(
          'absolute bottom-0 left-0 right-0 top-0 z-50 flex items-end justify-center bg-black/60 p-4',
          Platform.select({
            web: 'animate-in fade-in-0 fixed cursor-default [&>*]:cursor-auto items-center',
          }),
          className
        )}
        {...props}
        asChild={Platform.OS !== 'web'}
      >
        <AnimatedModalView entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)}>
          {children}
        </AnimatedModalView>
      </DialogPrimitive.Overlay>
    </FullWindowOverlay>
  );
}

function ModalContent({
  className,
  portalHost,
  children,
  ...props
}: DialogPrimitive.ContentProps &
  React.RefAttributes<DialogPrimitive.ContentRef> & {
    portalHost?: string;
  }) {
  return (
    <ModalPortal hostName={portalHost}>
      <ModalOverlay>
        <DialogPrimitive.Content
          className={cn(
            'bg-white dark:bg-gray-900 border-0 z-50 w-full max-w-md rounded-3xl shadow-2xl shadow-black/20 mx-4 overflow-hidden',
            Platform.select({
              web: 'animate-in fade-in-0 zoom-in-95 duration-300',
            }),
            className
          )}
          {...props}
        >
          <AnimatedModalView
            entering={Platform.OS === 'web' ? FadeIn.duration(300) : SlideInUp.duration(400).springify()}
            exiting={Platform.OS === 'web' ? FadeOut.duration(200) : SlideOutDown.duration(300)}
            className='w-full'
          >
            {children}
            <DialogPrimitive.Close
              className={cn(
                'absolute right-4 top-4 z-10 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center active:bg-gray-200 dark:active:bg-gray-700 transition-colors',
                Platform.select({
                  web: 'ring-offset-background focus:ring-ring data-[state=open]:bg-accent hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2',
                })
              )}
              hitSlop={12}
            >
              <Icon as={X} className={cn('text-gray-600 dark:text-gray-300 size-4 shrink-0')} />
              <Text className='sr-only'>Close</Text>
            </DialogPrimitive.Close>
          </AnimatedModalView>
        </DialogPrimitive.Content>
      </ModalOverlay>
    </ModalPortal>
  );
}

function ModalHeader({ className, ...props }: ViewProps) {
  return <View className={cn('flex flex-col px-6 pt-6 pb-4', className)} {...props} />;
}

function ModalBody({ className, ...props }: ViewProps) {
  return <View className={cn('flex flex-col px-6', className)} {...props} />;
}

function ModalFooter({ className, ...props }: ViewProps) {
  return <View className={cn('flex flex-col px-6 pt-4 pb-6 gap-3', className)} {...props} />;
}

function ModalTitle({
  className,
  ...props
}: DialogPrimitive.TitleProps & React.RefAttributes<DialogPrimitive.TitleRef>) {
  return (
    <DialogPrimitive.Title className={cn('text-foreground text-xl font-bold leading-tight', className)} {...props} />
  );
}

function ModalDescription({
  className,
  ...props
}: DialogPrimitive.DescriptionProps & React.RefAttributes<DialogPrimitive.DescriptionRef>) {
  return (
    <DialogPrimitive.Description
      className={cn('text-muted-foreground text-sm leading-relaxed mt-2', className)}
      {...props}
    />
  );
}

export {
  Modal,
  ModalBody,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalPortal,
  ModalTitle,
  ModalTrigger,
};
