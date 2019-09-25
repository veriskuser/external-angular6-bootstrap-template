import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MultiselectComponent } from './components/multiselect/multiselect.component';
import { ExamplesListComponent } from './components/examples-list/examples-list.component';
import { ExamplesRouterOutletComponent } from './components/examples-router-outlet/examples-router-outlet.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { CollapsibleComponent } from './components/collapsible/collapsible.component';

const exampleComponentRoutes: Routes = [
  {
    path: 'examples',
    component: ExamplesRouterOutletComponent,
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
      },
      {
        path: 'list',
        component: ExamplesListComponent
      },
      {
        path: 'multiselect',
        component: MultiselectComponent
      },
      {
        path: 'sidebar',
        component: SidebarComponent
      },
      { path: 'collapsible', component: CollapsibleComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(exampleComponentRoutes)],
  exports: [RouterModule]
})
export class ExampleComponentsRoutingModule {}
