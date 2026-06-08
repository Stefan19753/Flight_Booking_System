import { Component, ViewChild, ElementRef, AfterViewChecked, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatService, ChatMessage } from '../../services/chat.service';

const AIRPORT_MAP: Record<string, string> = {
  BCN: 'Barcelona', NRT: 'Tokyo',   LHR: 'London',       DXB: 'Dubai',
  CDG: 'Paris',     SIN: 'Singapore', SYD: 'Sydney',      JFK: 'New York',
  OTP: 'Bucharest', FRA: 'Frankfurt', AMS: 'Amsterdam',   LAX: 'Los Angeles',
  ORD: 'Chicago',   MIA: 'Miami',     BKK: 'Bangkok',
};

interface DisplayMessage extends ChatMessage {
  destCodes?: { code: string; city: string }[];
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './chatbot.html',
  styleUrl: './chatbot.css',
})
export class ChatbotComponent implements AfterViewChecked {
  @ViewChild('msgList') msgList!: ElementRef;

  private chatService = inject(ChatService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  open = false;
  loading = false;
  input = '';
  messages: DisplayMessage[] = [];
  private needsScroll = false;

  suggestions = [
    'Recommend a destination for me',
    'Which flights are cheapest?',
    'I want a direct flight only',
    'Fastest flight options?',
  ];

  toggle() {
    this.open = !this.open;
    if (this.open && this.messages.length === 0) {
      this.messages = [{
        role: 'assistant',
        content: "Hi! I'm SkyBook's travel assistant. Tell me where you want to go or what kind of trip you're after, and I'll find the best options for you.",
      }];
    }
  }

  useSuggestion(text: string) {
    this.input = text;
    this.send();
  }

  send() {
    const text = this.input.trim();
    if (!text || this.loading) return;
    this.input = '';
    this.messages = [...this.messages, { role: 'user', content: text }];
    this.loading = true;
    this.needsScroll = true;
    this.cdr.detectChanges();

    const apiMessages: ChatMessage[] = this.messages.map(({ role, content }) => ({ role, content }));

    this.chatService.send(apiMessages).subscribe({
      next: res => {
        const destCodes = this.extractCodes(res.reply);
        this.messages = [...this.messages, { role: 'assistant', content: res.reply, destCodes }];
        this.loading = false;
        this.needsScroll = true;
        this.cdr.detectChanges();
      },
      error: () => {
        this.messages = [...this.messages, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now. Please try again." }];
        this.loading = false;
        this.needsScroll = true;
        this.cdr.detectChanges();
      },
    });
  }

  onEnter(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.send(); }
  }

  searchDest(code: string) {
    this.router.navigate(['/'], { queryParams: { dest: code } });
    this.open = false;
  }

  ngAfterViewChecked() {
    if (this.needsScroll && this.msgList) {
      const el: HTMLElement = this.msgList.nativeElement;
      el.scrollTop = el.scrollHeight;
      this.needsScroll = false;
    }
  }

  private extractCodes(text: string): { code: string; city: string }[] {
    return Object.entries(AIRPORT_MAP)
      .filter(([code]) => text.includes(`(${code})`))
      .map(([code, city]) => ({ code, city }));
  }
}
