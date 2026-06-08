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
    { name: 'Stefan Groza', role: 'Lead Developer',   avatar: 'SG', img: '', desc: 'Full-stack engineer and creator of SkyBook.' },
    { name: 'Stefan Groza', role: 'UX Designer',      avatar: 'SG', img: '', desc: 'Designs clean, intuitive flight experiences.' },
    { name: 'Stefan Groza', role: 'Backend Engineer', avatar: 'SG', img: '', desc: 'Builds the APIs that power real-time tracking.' },
    { name: 'Stefan Groza', role: 'Product Manager',  avatar: 'SG', img: '', desc: 'Keeps the team focused on what travelers need.' },
  ];
}
