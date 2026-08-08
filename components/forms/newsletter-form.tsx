"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

const FormSchema = z.object({
  email: z.email({
    message: "Enter a valid email.",
  }),
});

export function NewsletterForm() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    form.reset();
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full sm:max-w-md"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <div>
                <FormLabel className="text-foreground text-base font-semibold tracking-tight">
                  Subscribe to our newsletter
                </FormLabel>
                <p className="text-muted-foreground mt-1 text-sm">
                  Get the latest updates, articles, and resources, sent to your
                  inbox weekly.
                </p>
              </div>

              <div className="flex w-full items-center gap-2">
                <FormControl>
                  <Input
                    type="email"
                    className="bg-muted/30 hover:bg-muted/50 focus-visible:bg-background rounded-full px-4 transition-colors"
                    placeholder="janedoe@example.com"
                    {...field}
                  />
                </FormControl>
                <Button
                  type="submit"
                  size="sm"
                  rounded="full"
                  className="shrink-0 px-5"
                >
                  Subscribe
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
