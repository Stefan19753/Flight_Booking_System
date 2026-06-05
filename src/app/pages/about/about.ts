import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  imports: [RouterLink],
  templateUrl: './about.html',
  styleUrl: './about.css'
})
export class About {
  team = [
    { name: 'Stefan Groza',    role: 'Lead Developer',     avatar: 'SG', desc: 'Full-stack engineer and creator of SkyBook.' },
    { name: 'Maria Ionescu',   role: 'UX Designer',        avatar: 'MI', desc: 'Designs clean, intuitive flight experiences.' },
    { name: 'Alexandru Pop',   role: 'Backend Engineer',   avatar: 'AP', desc: 'Builds the APIs that power real-time tracking.' },
    { name: 'Elena Constantin','role': 'Product Manager',  avatar: 'EC', desc: 'Keeps the team focused on what travelers need.' },
  ];
}
