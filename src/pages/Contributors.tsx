import { useState, useEffect } from 'react';
import { ExternalLink, Download, GitBranch, Users, TrendingUp } from 'lucide-react';

interface ContributorData {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
}

interface DownloadStats {
  totalDownloads: number;
  lastWeekDownloads: number;
  versions: Array<{
    version: string;
    downloads: number;
  }>;
}

export function Contributors() {
  const [contributors, setContributors] = useState<ContributorData[]>([]);
  const [downloadStats, setDownloadStats] = useState<DownloadStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch contributors from GitHub API
        const contributorsResponse = await fetch('https://api.github.com/repos/TimurbekDev/KippoGramm/contributors');
        const contributorsData = await contributorsResponse.json();
        if (Array.isArray(contributorsData)) {
          setContributors(contributorsData.slice(0, 10)); // Show top 10 contributors
        }

        // Fetch download statistics from NuGet API
        const nugetResponse = await fetch('https://api.nuget.org/v3-flatcontainer/kippo/index.json');
        const nugetData = await nugetResponse.json();

        // Fetch detailed stats for the package (includes per-version download counts)
        const statsResponse = await fetch('https://api-v2v3search-0.nuget.org/query?q=packageid:kippo');
        const statsData = await statsResponse.json();

        if (
          nugetData &&
          nugetData.versions &&
          statsData.data &&
          statsData.data.length > 0 &&
          statsData.data[0].versions
        ) {
          const packageData = statsData.data[0];
          // Map version to download count
          const versionMap: Record<string, number> = {};
          for (const v of packageData.versions) {
            versionMap[v.version] = v.downloads;
          }
          setDownloadStats({
            totalDownloads: packageData.totalDownloads || 0,
            lastWeekDownloads: 0, // NuGet API does not provide weekly stats
            versions: nugetData.versions.slice(-5).map((version:any) => ({
              version,
              downloads: versionMap[version] || 0
            }))
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-zinc-400 mt-4">Loading contributors and statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Header */}
      <section>
        <h1 className="text-3xl font-extrabold text-white mb-4">
          Contributors & Statistics
        </h1>
        <p className="text-lg text-zinc-400 leading-relaxed">
          Meet the amazing people who contribute to Kippo and explore the project's growth statistics.
        </p>
      </section>

      {/* Download Statistics */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <TrendingUp className="text-green-500" size={24} />
          Download Statistics
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/50">
            <div className="flex items-center gap-3 mb-2">
              <Download className="text-blue-500" size={20} />
              <h3 className="font-semibold text-white">Total Downloads</h3>
            </div>
            <p className="text-2xl font-bold text-blue-400">
              {downloadStats?.totalDownloads?.toLocaleString() || '0'}
            </p>
          </div>
          
          <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/50">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="text-green-500" size={20} />
              <h3 className="font-semibold text-white">Weekly Downloads</h3>
            </div>
            <p className="text-2xl font-bold text-green-400">
              {downloadStats?.lastWeekDownloads?.toLocaleString() || '0'}
            </p>
          </div>
          
          <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/50">
            <div className="flex items-center gap-3 mb-2">
              <GitBranch className="text-purple-500" size={20} />
              <h3 className="font-semibold text-white">Latest Version</h3>
            </div>
            <p className="text-2xl font-bold text-purple-400">v1.0.6</p>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/50">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Versions</h3>
          <div className="space-y-2">
            {downloadStats?.versions.map((version, _) => (
              <div key={version.version} className="flex items-center justify-between py-2 px-4 rounded-lg bg-zinc-800/50">
                <span className="font-mono text-zinc-300">{version.version}</span>
                <span className="text-zinc-400">{version.downloads.toLocaleString()} downloads</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contributors */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Users className="text-blue-500" size={24} />
          Contributors
        </h2>
        
        <p className="text-zinc-400 mb-6">
          Thank you to all the amazing people who have contributed to this project!
        </p>

        {contributors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {contributors.map((contributor) => (
              <a
                key={contributor.login}
                href={contributor.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-800/50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={contributor.avatar_url}
                    alt={contributor.login}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                      {contributor.login}
                    </h3>
                    <p className="text-sm text-zinc-400">
                      {contributor.contributions} contributions
                    </p>
                  </div>
                  <ExternalLink 
                    size={16} 
                    className="text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0" 
                  />
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="text-zinc-600 mx-auto mb-4" size={48} />
            <p className="text-zinc-500">No contributors data available</p>
          </div>
        )}
      </section>

      {/* Project Links */}
      <section className="p-6 rounded-xl border border-zinc-800 bg-linear-to-br from-zinc-900 to-zinc-950">
        <h2 className="text-xl font-bold text-white mb-4">Project Resources</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a
            href="https://github.com/TimurbekDev/KippoGramm"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors"
          >
            <GitBranch className="text-zinc-400" size={20} />
            <div>
              <h3 className="font-semibold text-white">GitHub Repository</h3>
              <p className="text-sm text-zinc-400">View source code, issues, and discussions</p>
            </div>
            <ExternalLink className="text-zinc-500 ml-auto" size={16} />
          </a>
          
          <a
            href="https://www.nuget.org/packages/Kippo"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors"
          >
            <Download className="text-zinc-400" size={20} />
            <div>
              <h3 className="font-semibold text-white">NuGet Package</h3>
              <p className="text-sm text-zinc-400">Install Kippo in your project</p>
            </div>
            <ExternalLink className="text-zinc-500 ml-auto" size={16} />
          </a>
        </div>
      </section>

      {/* How to Contribute */}
      <section className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/50">
        <h2 className="text-xl font-bold text-white mb-4">How to Contribute</h2>
        <div className="space-y-4 text-zinc-400">
          <p>
            We welcome contributions from everyone! Here are some ways you can help improve Kippo:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Report bugs or suggest features by opening an issue on GitHub</li>
            <li>Submit pull requests with bug fixes or new features</li>
            <li>Improve documentation and examples</li>
            <li>Share your experience and help other developers in discussions</li>
            <li>Star the repository to show your support</li>
          </ul>
          <p>
            Check out the <a href="https://github.com/TimurbekDev/KippoGramm/blob/main/CONTRIBUTING.md" className="text-blue-400 hover:text-blue-300" target="_blank" rel="noopener noreferrer">Contributing Guidelines</a> to get started.
          </p>
        </div>
      </section>
    </div>
  );
}