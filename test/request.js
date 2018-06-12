/**
 * Created by admin on 2016/3/23.
 */
'use strict';
const request = require('request');

let base64String1 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDY3IDc5LjE1Nzc0NywgMjAxNS8wMy8zMC0yMzo0MDo0MiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjlFNTk4NTJFOEQwNzExRTVCRDMxODk5QjNCRkQxQjU1IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjlFNTk4NTJGOEQwNzExRTVCRDMxODk5QjNCRkQxQjU1Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6OUU1OTg1MkM4RDA3MTFFNUJEMzE4OTlCM0JGRDFCNTUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6OUU1OTg1MkQ4RDA3MTFFNUJEMzE4OTlCM0JGRDFCNTUiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6nyCplAAAA7ElEQVR42uSVwQ6CMAyGGSFw8Sl9Aq94MGYxwXgyHjgRntKDAbPZhX+mjsF2GRebfIHQ9qesrBNa6yyF5Vki21S4Jx6RL80R2888Zo0ZnZ5MEUeicPycAjEKOR33u1UNuApCEifcuybgk8w/rFUsiIZ4owpzvRIVi6nwjMc0yP1q+T5xKdH6Qy9eFLaVSyZg7Aw0E5VupSFh3pxRz20MNXdN2FJ7hOtQXrINsvlSJGlekt8t2QZpIz/Vt1QtjymcXpa2p5gFN9zPeo458SIumBflzzDxnCBmBD6JA6Eixuad2BH7kPCfHk0fAQYAT5s+ThEcFPcAAAAASUVORK5CYII=';


let host = '127.0.0.1:19999';

request.post({
  uri    : `http://${host}/images/base64`,
  headers: {
    'Host': `${host}`
  },
  json   : {
    images: [
      //{
      //  name        : 'image1',
      //  base64String: base64String1
      //},
      {
        name        : 'image2',
        base64String: base64String2
      },
      {
        name        : 'image3',
        base64String: base64String3
      }
    ]
  }
}, (err, resp, body)=> {
  console.log(err);
  //console.log(resp.headers);
  console.log(body);
});