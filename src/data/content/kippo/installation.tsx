import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { CodeBlock } from '../../../components/docs/CodeBlock';
import { Callout } from '../../../components/docs/Callout';
import { useDocs } from '../../../context/DocsProvider';

export default function Installation() {
  const { pkg, resolvedVersion, hrefFor, packageData } = useDocs();
  const id = pkg.nugetId;
  // Use the concrete resolved version for PackageReference; fall back to latest stable.
  const refVersion =
    resolvedVersion && /^\d/.test(resolvedVersion)
      ? resolvedVersion
      : packageData?.latestStable ?? resolvedVersion;

  return (
    <>
      <h1>Installation</h1>
      <p className="lead">
        Install the {pkg.displayName} NuGet package into your .NET project.
      </p>

      <h2>.NET CLI</h2>
      <CodeBlock code={`dotnet add package ${id}`} language="bash" filename="Terminal" />

      <h2>Package Manager Console</h2>
      <CodeBlock code={`Install-Package ${id}`} language="powershell" filename="PMC" />

      <h2>PackageReference</h2>
      <p>Add directly to your <code>.csproj</code>:</p>
      <CodeBlock
        code={`<PackageReference Include="${id}" Version="${refVersion}" />`}
        language="xml"
        filename="MyTelegramBot.csproj"
      />

      <Callout type="info" title="Target frameworks">
        Kippo supports .NET 8, 9, and 10. Pick a version from the selector in the sidebar to
        install a specific release.
      </Callout>

      <h2>Next steps</h2>
      <p>
        With the package installed, continue to{' '}
        <Link to={hrefFor('getting-started')} className="inline-flex items-center gap-1">
          Getting Started <ArrowRight size={14} />
        </Link>{' '}
        to build your first bot.
      </p>
    </>
  );
}
