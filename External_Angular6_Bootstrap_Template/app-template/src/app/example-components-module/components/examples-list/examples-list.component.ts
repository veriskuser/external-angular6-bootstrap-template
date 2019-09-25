import { Component } from '@angular/core';
import { ExampleMetadataArray } from '../../example-metadata-array';

@Component({
  selector: 'app-examples-list',
  templateUrl: './examples-list.component.html'
})
export class ExamplesListComponent {
  private exampleMetadataArray = ExampleMetadataArray;
}
