import { getAudit } from '@/lib/mongodb'
import { notFound } from 'next/navigation'
import { CheckCircle, XCircle, AlertTriangle, ArrowLeft, Loader2, Cpu, Database, FileText, List, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export default async function ResultsPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const audit = await getAudit(params.id)

  if (!audit) {
    notFound()
  }

  if (audit.status === 'pending' || audit.status === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>
        <div className="text-center max-w-md mx-auto p-8 relative">
          <div className="relative inline-block mb-6">
            <div className="animate-spin rounded-full h-24 w-24 border-4 border-cyan-500/30 border-t-cyan-400 mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Cpu className="h-10 w-10 text-cyan-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gradient">Analyzing your website...</h2>
          <p className="text-muted-foreground mb-4">This usually takes 30-60 seconds</p>
          <div className="text-sm text-muted-foreground space-y-2">
            <p className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-400" /> Fetching your webpage</p>
            <p className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-400" /> Checking schema markup</p>
            <p className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-400" /> Analyzing content structure</p>
            <p className="flex items-center gap-2 animate-pulse"><Loader2 className="h-4 w-4 text-cyan-400 animate-spin" /> Calculating your score...</p>
          </div>
          <Button onClick={() => window.location.reload()} className="mt-6 bg-gradient-to-r from-cyan-500 to-purple-500">
            Refresh Results
          </Button>
        </div>
      </div>
    )
  }

  if (audit.status === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
        </div>
        <Card className="max-w-md mx-auto p-8 glass-card neon-border relative">
          <CardContent className="pt-0 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-4 border border-red-500/30">
              <XCircle className="h-10 w-10 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Analysis Failed</h2>
            <p className="text-muted-foreground mb-4">{audit.issues[0] || 'Something went wrong'}</p>
            <Link href="/audit">
              <Button className="bg-gradient-to-r from-cyan-500 to-purple-500">Try Again</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getGrade = (score: number) => {
    if (score >= 80) return { grade: 'A', color: 'text-green-400', bgColor: 'bg-green-500/20', borderColor: 'border-green-500/30', message: 'Excellent! Your page is well-optimized for AI search.' };
    if (score >= 60) return { grade: 'B', color: 'text-cyan-400', bgColor: 'bg-cyan-500/20', borderColor: 'border-cyan-500/30', message: 'Good start, but there\'s room for improvement.' }
    if (score >= 40) return { grade: 'C', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', borderColor: 'border-yellow-500/30', message: 'Moderate optimization needed.' }
    return { grade: 'D', color: 'text-red-400', bgColor: 'bg-red-500/20', borderColor: 'border-red-500/30', message: 'Significant improvements required for AI visibility.' }
  }

  const { grade, color, bgColor, borderColor, message } = getGrade(audit.score)

  return (
    <div className="min-h-screen py-12 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 max-w-4xl relative">
        <Link 
          href="/"
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to home
        </Link>

        <Card className="glass-card neon-border p-8 mb-6">
          <CardHeader className="pb-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2 text-gradient">Your Marrai Analysis Results</h1>
                <p className="text-muted-foreground break-all text-sm">{audit.url}</p>
              </div>
              <Badge className={`${bgColor} ${borderColor} border text-lg px-4 py-1`}>
                <Sparkles className="w-4 h-4 mr-1" />
                AI Powered
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 border-y border-white/10 my-6 relative">
              <div className={`inline-block ${bgColor} ${borderColor} border rounded-2xl px-8 py-6 mb-4`}>
                <div className={`text-7xl font-bold ${color}`}>
                  {audit.score}<span className="text-2xl text-muted-foreground">/100</span>
                </div>
              </div>
              <div className="text-4xl font-bold mb-2">
                <span className={color}>Grade: {grade}</span>
              </div>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {message}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-2xl font-bold text-cyan-400 mb-1">
                  {audit.hasSchema ? <CheckCircle className="h-8 w-8 mx-auto" /> : <XCircle className="h-8 w-8 mx-auto text-red-400" />}
                </div>
                <div className="text-sm text-muted-foreground">Schema Markup</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-2xl font-bold text-foreground">{audit.h1Count}</div>
                <div className="text-sm text-muted-foreground">H1 Tags</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-2xl font-bold text-foreground">{audit.questionHeadings}</div>
                <div className="text-sm text-muted-foreground">Question Headings</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-2xl font-bold text-foreground">{audit.listCount + audit.tableCount}</div>
                <div className="text-sm text-muted-foreground">Structured Elements</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {audit.issues.length > 0 && (
          <Card className="glass-card border-red-500/30 mb-6 p-6">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-red-400">
                <XCircle className="h-6 w-6" />
                Critical Issues ({audit.issues.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                These issues are preventing your page from appearing in AI search results:
              </p>
              <ul className="space-y-3">
                {audit.issues.map((issue, i) => (
                  <li key={i} className="flex items-start bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                    <span className="text-red-400 mr-3 font-bold text-lg">•</span>
                    <span className="text-foreground">{issue}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {audit.warnings.length > 0 && (
          <Card className="glass-card border-yellow-500/30 mb-6 p-6">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-yellow-400">
                <AlertTriangle className="h-6 w-6" />
                Warnings ({audit.warnings.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                These issues may reduce your AI visibility:
              </p>
              <ul className="space-y-3">
                {audit.warnings.map((warning, i) => (
                  <li key={i} className="flex items-start bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
                    <span className="text-yellow-400 mr-3 font-bold text-lg">•</span>
                    <span className="text-foreground">{warning}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <Card className="glass-card border-cyan-500/30 mb-6 p-6">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-cyan-400">
              <CheckCircle className="h-6 w-6" />
              Recommendations ({audit.recommendations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Follow these steps to improve your AI visibility:
            </p>
            <ol className="space-y-3">
              {audit.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start bg-cyan-500/10 p-3 rounded-lg border border-cyan-500/20">
                  <span className="text-cyan-400 mr-3 font-bold">{i + 1}.</span>
                  <span className="text-foreground">{rec}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10 mb-6 p-6">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-cyan-400" />
              Technical Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div className="p-3 rounded-lg bg-white/5">
                <div className="text-muted-foreground mb-1 flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Schema Types Found
                </div>
                <div className="text-foreground font-medium">
                  {audit.schemaTypes.length > 0 
                    ? audit.schemaTypes.join(', ')
                    : 'None detected'}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <div className="text-muted-foreground mb-1 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Robots.txt Status
                </div>
                <div className={audit.robotsBlocked ? 'text-red-400' : 'text-green-400'}>
                  {audit.robotsBlocked ? 'AI bots blocked' : 'AI bots allowed'}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <div className="text-muted-foreground mb-1 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  First Paragraph
                </div>
                <div className="text-foreground font-medium">
                  {audit.firstParaWordCount} words
                  {audit.firstParaWordCount >= 40 && audit.firstParaWordCount <= 80 && (
                    <span className="text-green-400 ml-2">✓ (optimal)</span>
                  )}
                  {!(audit.firstParaWordCount >= 40 && audit.firstParaWordCount <= 80) && (
                    <span className="text-yellow-400 ml-2">(40-80 recommended)</span>
                  )}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <div className="text-muted-foreground mb-1 flex items-center gap-2">
                  <List className="h-4 w-4" />
                  Structured Content
                </div>
                <div className="text-foreground font-medium">
                  {audit.listCount} lists, {audit.tableCount} tables
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card neon-border p-8 text-center gradient-border relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-cyan-500/10" />
          <div className="relative">
            <h2 className="text-3xl font-bold mb-4">
              Need Help Growing Your Business?
            </h2>
            <p className="text-muted-foreground text-lg mb-6">
              Marrai specializes in AI-powered marketing solutions. 
              Let us help you transform your digital presence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="mailto:your.email@gmail.com?subject=Marrai Help Request">
                <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-purple-500">
                  Schedule Free Consultation
                </Button>
              </a>
              <Link href="/audit">
                <Button size="lg" variant="outline" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10">
                  Analyze Another Site
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Audit completed on {new Date(audit.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
        </div>
      </div>
    </div>
  )
}