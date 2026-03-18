import Link from 'next/link';
import Header from '@/components/dashboard/Header';
import AppFooter from '@/components/shared/AppFooter';

export default function HowToDoPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="max-w-4xl mx-auto w-full px-6 lg:px-12 pt-32 pb-20">
        <p className="label mb-4">Setup Guide</p>
        <h1 className="display-lg mb-4">
          Add <span className="font-serif italic">Pulse Analytics</span> to your site
        </h1>
        <p className="text-muted-foreground mb-10">
          Follow these steps to install tracking and confirm events are reaching your dashboard.
        </p>

        <div className="space-y-6">
          <section className="border border-border bg-card p-6">
            <h2 className="heading mb-2">1) Create your site and get your hex ID</h2>
            <p className="text-sm text-muted-foreground">
              Go to Public Dashboards and create a site. You will receive a unique hex value like
              <span className="font-mono"> a1b2c3d4e5f6</span>.
            </p>
          </section>

          <section className="border border-border bg-card p-6">
            <h2 className="heading mb-2">2) Add the tracking script in your HTML</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Paste this snippet before your closing <span className="font-mono">&lt;/body&gt;</span> tag and replace
              <span className="font-mono"> YOUR_SITE_HEX</span>.
            </p>

            <pre className="bg-secondary border border-border p-4 overflow-x-auto text-xs md:text-sm leading-6 font-mono">
{`<script
  defer
  src="https://pulsev0.vercel.app/ultrafree.js"
  data-site-hex="YOUR_SITE_HEX"
></script>`}
            </pre>

            <p className="text-xs text-muted-foreground mt-3">
              If you host Pulse on your own domain, use that domain in the <span className="font-mono">src</span> value.
            </p>
          </section>

          <section className="border border-border bg-card p-6">
            <h2 className="heading mb-2">3) Verify tracking is working</h2>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
              <li>Open your website in a new tab and navigate between pages.</li>
              <li>Check browser dev tools → Network and confirm POST requests are sent.</li>
              <li>Open your analytics dashboard and confirm page events appear.</li>
            </ul>
          </section>

          {/* <section className="border border-border bg-card p-6">
            <h2 className="heading mb-2">4) Optional manual events</h2>
            <p className="text-sm text-muted-foreground mb-4">
              You can trigger custom events after initialization.
            </p>
            <pre className="bg-secondary border border-border p-4 overflow-x-auto text-xs md:text-sm leading-6 font-mono">
{`window.UltrafreeAnalytics.trackEvent({
  event_type: 'cta_click',
  cta_label: 'pricing_start_free'
});`}
            </pre>
          </section> */}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/public/new"
            className="bg-foreground text-background px-5 py-3 text-sm font-mono hover:opacity-90 transition-opacity"
          >
            Create Dashboard →
          </Link>
          <Link
            href="/public"
            className="border border-border px-5 py-3 text-sm font-mono text-muted-foreground hover:text-foreground transition-colors"
          >
            View Public Dashboards
          </Link>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
