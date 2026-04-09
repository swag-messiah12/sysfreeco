"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Loader2, Send, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submissionSchema, SubmissionInput } from "@/lib/validations";

const CITIES = ["Toronto", "Hamilton", "Cambridge", "Mississauga", "Brampton", "Other"];

function FieldError({ message }: { message?: string }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="text-xs text-red-400 mt-1"
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

export default function SubmitPage() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SubmissionInput>({
    resolver: zodResolver(submissionSchema),
  });

  const onSubmit = async (data: SubmissionInput) => {
    setServerError(null);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Server error (${res.status})`);
      }

      setSubmitted(true);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            {submitted ? (
              /* ─── Success state ─── */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card rounded-2xl p-10 text-center border border-emerald-500/20 bg-emerald-500/5"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                  className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5"
                >
                  <CheckCircle size={28} className="text-emerald-400" />
                </motion.div>
                <h2 className="text-2xl font-bold text-zinc-100 mb-2">Thanks for the tip!</h2>
                <p className="text-zinc-400 text-sm mb-7">
                  We&apos;ll scan their website and update the score. If they turn out to be
                  legit, they&apos;ll show up on the map soon.
                </p>
                <div className="flex gap-3 justify-center">
                  <Link href="/explore">
                    <Button className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold">
                      View the map
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => setSubmitted(false)}
                    className="border-white/12 text-zinc-300 hover:bg-white/5"
                  >
                    Submit another
                  </Button>
                </div>
              </motion.div>
            ) : (
              /* ─── Form ─── */
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="mb-8">
                  <Link
                    href="/explore"
                    className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-6"
                  >
                    <ArrowLeft size={12} />
                    Back to map
                  </Link>
                  <h1 className="text-3xl font-bold text-zinc-100">Submit a restaurant</h1>
                  <p className="text-zinc-500 text-sm mt-2">
                    Know a spot that sources independently? Add it and we&apos;ll scan it.
                  </p>
                </div>

                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="glass-card rounded-2xl p-7 space-y-5"
                >
                  {/* Name */}
                  <div>
                    <Label htmlFor="name" className="text-xs text-zinc-400 mb-1.5 block">
                      Restaurant name <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="e.g. Farmhouse Tavern"
                      {...register("name")}
                      className="bg-white/5 border-white/10 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-emerald-500/50"
                    />
                    <FieldError message={errors.name?.message} />
                  </div>

                  {/* Address */}
                  <div>
                    <Label htmlFor="address" className="text-xs text-zinc-400 mb-1.5 block">
                      Address <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="address"
                      placeholder="e.g. 1627 Dupont St, Toronto, ON"
                      {...register("address")}
                      className="bg-white/5 border-white/10 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-emerald-500/50"
                    />
                    <FieldError message={errors.address?.message} />
                  </div>

                  {/* City */}
                  <div>
                    <Label className="text-xs text-zinc-400 mb-1.5 block">
                      City <span className="text-red-400">*</span>
                    </Label>
                    <Select onValueChange={(v) => setValue("city", v as SubmissionInput["city"])}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-zinc-200 focus:ring-emerald-500/50">
                        <SelectValue placeholder="Select a city" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-white/10">
                        {CITIES.map((c) => (
                          <SelectItem
                            key={c}
                            value={c}
                            className="text-zinc-300 focus:bg-emerald-500/10 focus:text-emerald-400"
                          >
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError message={errors.city?.message} />
                  </div>

                  {/* Website */}
                  <div>
                    <Label htmlFor="website" className="text-xs text-zinc-400 mb-1.5 block">
                      Website URL
                    </Label>
                    <Input
                      id="website"
                      placeholder="https://restaurant.ca"
                      type="url"
                      {...register("website")}
                      className="bg-white/5 border-white/10 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-emerald-500/50"
                    />
                    <FieldError message={errors.website?.message} />
                  </div>

                  {/* Phone */}
                  <div>
                    <Label htmlFor="phone" className="text-xs text-zinc-400 mb-1.5 block">
                      Phone (optional)
                    </Label>
                    <Input
                      id="phone"
                      placeholder="(416) 555-0100"
                      type="tel"
                      {...register("phone")}
                      className="bg-white/5 border-white/10 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-emerald-500/50"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <Label htmlFor="notes" className="text-xs text-zinc-400 mb-1.5 block">
                      Why do you think they source independently? (optional)
                    </Label>
                    <Textarea
                      id="notes"
                      placeholder="e.g. They mention 100km Foods on their menu, all produce is from local farms..."
                      {...register("notes")}
                      rows={3}
                      className="bg-white/5 border-white/10 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-emerald-500/50 resize-none"
                    />
                    <FieldError message={errors.notes?.message} />
                  </div>

                  {/* Email */}
                  <div>
                    <Label htmlFor="email" className="text-xs text-zinc-400 mb-1.5 block">
                      Your email (optional — for follow-up)
                    </Label>
                    <Input
                      id="email"
                      placeholder="you@example.com"
                      type="email"
                      {...register("email")}
                      className="bg-white/5 border-white/10 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-emerald-500/50"
                    />
                    <FieldError message={errors.email?.message} />
                  </div>

                  {/* Server error */}
                  <AnimatePresence>
                    {serverError && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400"
                      >
                        {serverError}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold shadow-lg shadow-emerald-500/20 disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={15} />
                        Submit restaurant
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-zinc-600 text-center">
                    Submissions are reviewed before appearing on the map.
                    We respect your privacy — your email will never be shared.
                  </p>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}
