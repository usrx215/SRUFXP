meta:
  id: mtk_image_bin
  title: mediatek firmware .png .bin container
  application: used by firmware in mediatek based blu ray players to store (at least) png images
  file-extension: bin
  license: GPL-3.0-or-later
  endian: le
  bit-endian: le

seq:
-   id: entrycount
    type: u4
-   id: files
    type: ftentry
    repeat: expr
    repeat-expr: entrycount

types:
    ftentry:
        seq:
        -   id: hres
            type: u2
        -   id: vres
            type: u2
        -   id: flags1
            type: u1
        -   id: flags2
            type: u1
        -   id: unused
            size: 6
        -   id: filesize
            type: u4
        -   id: offset
            type: u4

        instances:
            file:
                pos: offset
                size: filesize
