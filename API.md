## Classes

<dl>
<dt><a href="#GoonSPA">GoonSPA</a></dt>
<dd>Public GOON SQUAD HTML template (settings/local.js <code>site.*</code>).</dd>
<dt><a href="#GoonSite">GoonSite</a></dt>
<dd>Bundles GoonSPA with FabricSite.</dd>
<dt><a href="#HTMLCompiler">HTMLCompiler</a></dt>
<dd>Writes <code>assets/index.html</code> from GoonSPA (no webpack / Hub UI).</dd>
<dt><a href="#GoonVC">GoonVC</a></dt>
<dd>HTML zipper: <code>@fabric/http</code> server plus Hub API reverse-proxy. Not a Hub.</dd>
</dl>

## Hub API zipper

Same-origin paths forwarded to <code>FABRIC_HUB_ORIGIN</code> (default
<code>https://hub.fabric.pub</code>):

- <code>/sessions</code> (HTML GET stays on GoonSPA; JSON/POST proxy)
- <code>/device-links</code>
- <code>/services/rpc</code>
- <code>/identity/cluster</code>, <code>/identity/cross-sign</code>

GoonCitizen lives at <code>https://relay.goon.vc</code>. This process does not
mount <code>/services/star-citizen</code> and does not listen as a Fabric Peer.
