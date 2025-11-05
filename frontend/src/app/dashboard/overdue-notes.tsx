import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import { PromissoryNote } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'

interface OverdueNotesProps {
  notes: PromissoryNote[]
}

export function OverdueNotes({ notes }: OverdueNotesProps) {
  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Vadesi Geçen Senetler
        </CardTitle>
      </CardHeader>
      <CardContent>
        {notes.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-4">
            Vadesi geçen senet bulunmuyor
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div
                key={note.id}
                className="p-3 bg-destructive/5 rounded-lg border border-destructive/20"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm font-medium">{note.title}</p>
                  <Badge variant="destructive" className="text-xs">
                    Vadesi Geçti
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Tutar: {formatCurrency(note.amount)}</p>
                  <p>Vade: {formatDate(note.due_date)}</p>
                </div>
              </div>
            ))}
            {notes.length > 0 && (
              <Button variant="outline" className="w-full" size="sm" asChild>
                <Link href="/promissory-notes?status=overdue">
                  Tümünü Gör ({notes.length})
                </Link>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}