import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { FooterComponent, HeaderComponent } from './shared/layout';
import { HomeComponent } from './home.component';

import { ExampleComponentsModule } from './example-components-module/example-components.module';

const appRoutes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' }
];

@NgModule({
  declarations: [AppComponent, FooterComponent, HeaderComponent, HomeComponent],
  imports: [
    BrowserModule,
    ExampleComponentsModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
