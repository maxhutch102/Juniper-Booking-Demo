import Link from "next/link";

export default function NoAccessPage() {
  return <main className="access-page">
    <span className="wordmark">Juniper <em>Studio</em></span>
    <p className="eyebrow">Private business center</p>
    <h1>Your account has not been invited yet.</h1>
    <p>Ask the salon owner to add the email attached to your ChatGPT account, then sign in again.</p>
    <div><Link className="button button-dark" href="/">Back to Juniper Studio</Link><a className="button" href="/signout-with-chatgpt?return_to=/">Sign out</a></div>
  </main>;
}
