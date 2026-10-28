/** Isolated UI preview: real components, fictional data, no real auth/database/API mutations. */
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { createRequire } = require("node:module");
const root = path.resolve(__dirname, "..");
const runtime =
  process.env.DESIGN_PREVIEW_RUNTIME || path.join(root, "node_modules");
const runtimeRequire = createRequire(path.join(runtime, "_preview.cjs"));
const esbuild = runtimeRequire("esbuild");
const buildDir = fs.mkdtempSync(
  path.join(os.tmpdir(), "campus-design-preview-"),
);
const outDir = path.join(root, "artifacts");
fs.mkdirSync(outDir, { recursive: true });
const mocks = {
  "next/link": `import React from 'react'; export default function Link({href,children,...props}){return React.createElement('a',{...props,href,onClick:e=>{props.onClick?.(e);if(!e.defaultPrevented&&typeof href==='string'&&href.startsWith('/')){e.preventDefault();window.location.search='?screen='+encodeURIComponent(href)}}},children)}`,
  "next/navigation": `export function usePathname(){return (typeof window==='undefined' ? globalThis.__previewScreen||'/' : new URLSearchParams(window.location.search).get('screen')||'/').split('?')[0].split('#')[0]} export function useRouter(){return {push:p=>{window.location.search='?screen='+encodeURIComponent(p)},refresh:()=>{if(typeof window!=='undefined')window.location.reload()}}}`,
  "next-auth/react": `export async function signIn(){return {error:'PreviewOnly'}} export async function signOut(){window.location.search='?screen=%2F'}`,
};
const entry = `
import React from 'react';
import {HomeContent} from '@/components/home/home-content';
import {SiteHeader,AppShell} from '@/components/layout/app-shell';
import {EmergencyBanner} from '@/components/layout/emergency-banner';
import {SiteFooter} from '@/components/layout/site-footer';
import {AuthLayout} from '@/components/auth/auth-layout';
import {AuthForm} from '@/components/auth/auth-form';
import {ReportsList} from '@/components/reports/reports-list';
import {ReportForm} from '@/components/reports/report-form';
import {ReportDetail} from '@/components/reports/report-detail';
import {StaffQueue} from '@/components/staff/staff-queue';
import {StaffActions} from '@/components/staff/staff-actions';
import {PageHeading} from '@/components/ui/page-heading';
import {ProfileContent} from '@/components/profile/profile-content';
import Contacts from '@/app/contacts/page';
import {locations,reports,redacted,staffReports} from '${path.join(root, "tests/fixtures/design.ts").replaceAll("\\", "/")}';
export function Preview({screen='/'}){
  const cleanScreen=(screen||'/').split('?')[0].split('#')[0].replace(/\\/+$/, '')||'/';
  const staff=cleanScreen.startsWith('/staff');
  const isPublicMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('mode') === 'public';
  const publicScreen = isPublicMode || ['/','/login','/register'].includes(cleanScreen);

  const [customAvatar, setCustomAvatar] = typeof window !== 'undefined'
    ? React.useState(() => {
        try { return localStorage.getItem('cg_preview_avatar') || null; } catch { return null; }
      })
    : [null, () => {}];

  React.useEffect(() => {
    const handleAvatar = (e) => {
      const img = e.detail?.image ?? null;
      setCustomAvatar(img);
      try {
        if (img) localStorage.setItem('cg_preview_avatar', img);
        else localStorage.removeItem('cg_preview_avatar');
      } catch {}
    };
    window.addEventListener('campusguard:avatar-updated', handleAvatar);
    return () => window.removeEventListener('campusguard:avatar-updated', handleAvatar);
  }, []);

  const account=publicScreen?null:{name:staff?'Demo Security One':'Demo Student One',role:staff?'SECURITY':'STUDENT',email:staff?'security1@demo.test':'student1@demo.test',image:customAvatar};
  let content;
  if(cleanScreen==='/')content=<HomeContent/>;
  else if(cleanScreen==='/contacts')content=<Contacts/>;
  else if(cleanScreen==='/login'||cleanScreen==='/register')content=<AuthLayout register={cleanScreen==='/register'}><AuthForm register={cleanScreen==='/register'}/></AuthLayout>;
  else if(cleanScreen==='/reports')content=<div className="shell page-content"><PageHeading eyebrow="Student portal" title="My reports" description="Track your submitted campus concerns, review receiving channels, and follow status updates." action={<a className="button button-primary button-new-report" href="?screen=%2Freport%2Fnew">+ New report</a>}/><ReportsList reports={reports}/></div>;
  else if(cleanScreen==='/profile'||cleanScreen.startsWith('/profile'))content=<div className="shell page-content"><ProfileContent user={account||{name:'Demo Student One',email:'student1@demo.test',role:'STUDENT',id:'demo-student-uuid',image:customAvatar}}/></div>;
  else if(cleanScreen==='/report/new')content=<div className="shell page-content"><PageHeading eyebrow="Student portal" title="Report an incident" description="Tell us what happened and choose who receives it."/><div className="report-layout"><ReportForm locations={locations} initialChannel={screen.includes('COMMITTEE')?'COMMITTEE':'SECURITY'}/><aside className="report-aside"><div className="panel next-panel"><h3>Before you report</h3><p>For immediate danger, go directly to the QRS at the Senate Building. This app is not monitored 24/7.</p></div></aside></div></div>;
  else if(cleanScreen==='/staff')content=<div className="shell page-content"><PageHeading eyebrow="Security responder portal" title="Report queue" description="Review, assign, and follow up on reports in your receiving channel."/><StaffQueue initialReports={staffReports} channel="Security"/></div>;
  else if(cleanScreen.startsWith('/staff/reports/')){const report=cleanScreen.endsWith('000022')?redacted:{...(staffReports.find(r=>cleanScreen.endsWith(r.id||r.ref))||staffReports[0]),reporter:{id:'demo-reporter',name:'Demo Student One',email:'student1@demo.test'}};content=<ReportDetail report={report} staff actions={<StaffActions report={report} users={[{id:'demo-security',name:'Demo Security One'}]} userId="demo-security" committee={false}/>}/>;}
  else if(cleanScreen.startsWith('/reports/')){const report=reports.find(r=>cleanScreen.endsWith(r.ref))||reports[0];content=<ReportDetail report={report}/>;}
  else content=<div className="shell page-content"><ProfileContent user={account||{name:'Demo Student One',email:'student1@demo.test',role:'STUDENT',id:'demo-student-uuid',image:customAvatar}}/></div>;
  return <><div className="preview-notice">Design preview · fictional data · reports are not saved</div><a className="skip-link" href="#main">Skip to content</a><EmergencyBanner account={account}/><SiteHeader account={account}/><main id="main"><AppShell account={account}>{content}</AppShell></main><SiteFooter account={account}/></>;
}
export {staffReports};
`;
const plugins = [
  {
    name: "preview-only-next-adapters",
    setup(build) {
      build.onResolve(
        { filter: /^(next\/link|next\/navigation|next-auth\/react)$/ },
        (args) => ({ path: args.path, namespace: "preview-mock" }),
      );
      build.onLoad({ filter: /.*/, namespace: "preview-mock" }, (args) => ({
        contents: mocks[args.path],
        loader: "jsx",
        resolveDir: root,
      }));
      build.onResolve({ filter: /^@\// }, (args) => {
        const name = path.join(root, "src", args.path.slice(2));
        for (const candidate of [
          name + ".tsx",
          name + ".ts",
          path.join(name, "index.ts"),
        ])
          if (fs.existsSync(candidate)) return { path: candidate };
        return null;
      });
    },
  },
];
(async () => {
  const common = {
    bundle: true,
    nodePaths: [runtime],
    plugins,
    jsx: "automatic",
    define: { "process.env.NODE_ENV": '"production"' },
    logLevel: "silent",
  };
  const browserEntry =
    entry +
    `\nimport {createRoot} from 'react-dom/client';\nwindow.fetch=async(url,options={})=>{
      const s = String(url);
      if (s.startsWith('/api/reports') && (!options.method || options.method === 'GET')) {
        return new Response(JSON.stringify(staffReports), { headers: { 'Content-Type': 'application/json' } });
      }
      if (s.startsWith('/api/user/avatar')) {
        if (options.method === 'DELETE') {
          return new Response(JSON.stringify({ success: true, image: null }), { headers: { 'Content-Type': 'application/json' } });
        }
        try {
          const body = options.body ? JSON.parse(options.body) : {};
          return new Response(JSON.stringify({ success: true, image: body.image || null }), { headers: { 'Content-Type': 'application/json' } });
        } catch {
          return new Response(JSON.stringify({ success: true, image: null }), { headers: { 'Content-Type': 'application/json' } });
        }
      }
      return new Response(JSON.stringify({ error: 'Design preview only. Start the Next.js app to save or update reports.' }), { status: 503, headers: { 'Content-Type': 'application/json' } });
    };\ncreateRoot(document.getElementById('root')).render(<Preview screen={new URLSearchParams(location.search).get('screen')||'/'}/>);`;
  const result = await esbuild.build({
    ...common,
    stdin: {
      contents: browserEntry,
      loader: "tsx",
      resolveDir: root,
      sourcefile: "design-preview.tsx",
    },
    platform: "browser",
    format: "iife",
    minify: true,
    write: false,
  });
  const css =
    ["tokens.css", "base.css", "layout.css", "components.css", "pages.css"]
      .map((name) =>
        fs.readFileSync(path.join(root, "src/styles", name), "utf8"),
      )
      .join("\n") +
    "\n#root{display:flex;flex-direction:column;min-height:100dvh}.preview-notice{padding:8px 16px;background:var(--color-nav);color:var(--color-on-nav);text-align:center;font:14px/1.6 Arial,sans-serif}";
  const js = result.outputFiles[0].text.replaceAll("</script", "<\\/script");
  fs.writeFileSync(
    path.join(outDir, "design-preview.html"),
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CampusGuard · Design preview</title><style>' +
      css +
      '</style></head><body><div id="root"></div><script>' +
      js +
      "</script></body></html>",
  );
  // Render every screen with React's server renderer too; preview adapters remain isolated.
  const ssr = await esbuild.build({
    ...common,
    stdin: {
      contents: entry,
      loader: "tsx",
      resolveDir: root,
      sourcefile: "design-preview-ssr.tsx",
    },
    platform: "node",
    format: "cjs",
    external: ["react", "react-dom", "react-dom/server"],
    write: false,
  });
  const ssrFile = path.join(buildDir, "render.cjs");
  fs.writeFileSync(ssrFile, ssr.outputFiles[0].text);
  const Module = require("node:module");
  const loaded = new Module(ssrFile, module);
  loaded.filename = ssrFile;
  loaded.paths = [runtime];
  loaded._compile(fs.readFileSync(ssrFile, "utf8"), ssrFile);
  const React = runtimeRequire("react");
  const { renderToStaticMarkup } = runtimeRequire("react-dom/server");
  const screens = [
    "/",
    "/contacts",
    "/login",
    "/register",
    "/profile",
    "/reports",
    "/report/new",
    "/staff",
    "/reports/SCS-2026-000021",
    "/staff/reports/SCS-2026-000022",
  ];
  for (const screen of screens) {
    global.__previewScreen = screen;
    const html = renderToStaticMarkup(
      React.createElement(loaded.exports.Preview, { screen }),
    );
    if (!html.includes("<h1") || !html.includes('id="main"'))
      throw new Error("Missing page structure: " + screen);
    fs.writeFileSync(
      path.join(buildDir, screen.replaceAll("/", "_") + ".html"),
      html,
    );
  }
  delete global.__previewScreen;
  fs.writeFileSync(
    path.join(outDir, "design-preview-results.json"),
    JSON.stringify(
      {
        screens,
        rendered: screens.length,
        kind: "Isolated component rendering; fictional data; Next.js auth/database/HTTP mutations are not exercised",
        preview: path.join(outDir, "design-preview.html"),
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    "DESIGN_PREVIEW_RENDERED: " +
      screens.length +
      " screens; " +
      path.join(outDir, "design-preview.html"),
  );
})()
  .catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  })
  .finally(() => fs.rmSync(buildDir, { recursive: true, force: true }));
