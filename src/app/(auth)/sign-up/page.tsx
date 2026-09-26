'use client';

import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { singUpSchema } from '@/schemas/singUpSchema';

export default function SignUpForm() {
  const [username, setUsername] = useState('');
  const [debouncedUsername, setDebouncedUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const form = useForm<z.infer<typeof singUpSchema>>({
    resolver: zodResolver(singUpSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  // Wait until the user stops typing for 300ms before checking the username
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedUsername(username), 300);
    return () => clearTimeout(timer);
  }, [username]);

  useEffect(() => {
    if (!debouncedUsername) return;
    let cancelled = false;

    const checkUsernameUnique = async () => {
      setIsCheckingUsername(true);
      setUsernameStatus(null);
      try {
        const response = await fetch(
          `/api/check-username-unique?username=${encodeURIComponent(debouncedUsername)}`
        );
        const data: ApiResponse = await response.json();
        if (!cancelled) {
          setUsernameStatus({ ok: data.success, text: data.message ?? '' });
        }
      } catch {
        if (!cancelled) setUsernameStatus({ ok: false, text: 'Error checking username' });
      } finally {
        if (!cancelled) setIsCheckingUsername(false);
      }
    };
    checkUsernameUnique();

    return () => {
      cancelled = true;
    };
  }, [debouncedUsername]);

  const onSubmit = async (data: z.infer<typeof singUpSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result: ApiResponse = await response.json();

      if (!response.ok || !result.success) {
        toast.error('Sign Up Failed', {
          description: result.message ?? 'There was a problem with your sign-up. Please try again.',
        });
        return;
      }

      toast.success('Success', { description: result.message });
      router.replace(`/verify/${data.username}`);
    } catch (error) {
      console.error('Error during sign-up:', error);
      toast.error('Sign Up Failed', {
        description: 'There was a problem with your sign-up. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Join True Feedback
          </h1>
          <p className="mb-4">Sign up to start your anonymous adventure</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="username"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <Input
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      setUsername(e.target.value);
                    }}
                  />
                  {isCheckingUsername && <Loader2 className="animate-spin" />}
                  {!isCheckingUsername && username && usernameStatus && (
                    <p
                      className={`text-sm ${
                        usernameStatus.ok ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {usernameStatus.text}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <Input {...field} name="email" />
                  <p className='text-gray-400 text-sm'>We will send you a verification code</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <Input type="password" {...field} name="password" />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className='w-full' disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                'Sign Up'
              )}
            </Button>
          </form>
        </Form>
        <div className="text-center mt-4">
          <p>
            Already a member?{' '}
            <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
