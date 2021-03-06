---
title: Understanding Sass lists
tags:
  - sass
  - lists
---

> **Edit (2015/05/28):** After realising this article ranks up incredibly high on _Sass_ Google searches, I come back to it to clear a few things up. Deletions are lined-through, additions are in italic.

Lists have to be the most complicated and vicious thing in the whole Sass language. The main problem with lists -if a problem it is- is that the syntax is way too permissive. You can do pretty much whatever you want.

Anyway, I recently had the opportunity to write [an article for CSS-Tricks](https://css-tricks.com/striped-background-gradients/) about a Sass function involving quite a lot of list manipulation. I introduced the topic by clearing a couple of things regarding Sass lists but I wanted to write a more in-depth article.

## Creating a Sass list

First things first. <span style="text-decoration: line-through">Even creating a Sass list can be tricky. Indeed,</span> Sass isn’t very strict with variable types. Basically it means you can process a list quite like a string, or use list functions on a <span style="text-decoration: line-through">string</span> _single value_. It is <span style="text-decoration: line-through">basically</span> _kind of_ a mess.

<span style="text-decoration: line-through">Anyway, we have a couple of ways to initialize an empty variable (that could be treated as a list):</span> _There is a single way to initialize an empty variable (whatever that means), and it’s with `null`._

> Sass isn’t very strict with variable type.

```scss
$a: ();
$b: unquote('');
$c: null;
$d: (null);
```

Now we have defined our variables, we will check their type. Just for fun.

```scss
type-of($a) -> list
type-of($b) -> string
type-of($c) -> null
type-of($d) -> null
```

Since `$c` and `$d` are stricly equivalent, we will remove the later from the next tests. Let’s check the length of each variable.

```scss
length($a) -> 0
length($b) -> 1
length($c) -> 1
```

`$a` being 0 item long is what we would have expected since it is an empty list. String being 1 item long isn’t that odd either since it is a string. <span style="text-decoration: line-through">However the <code>null</code> variable being 1 item long is kind of weird; more on this later.</span> _It’s not weird either; `null` is pretty much a value like another, so it has a length of 1._

## Sass list “fun” facts

This section has been quickly covered in the article at CSS-Tricks but since it is the very basics I have to put this here as well.

**You can use spaces or commas as separator.** Even if I feel more comfortable with commas since it is the classic separator for arrays (JavaScript, PHP…). _You can check the separator of a list with the `list-separator($list)` function._

```scss
$list-space: 'item-1' 'item-2' 'item-3';
$list-comma: 'item-1', 'item-2', 'item-3';
```

_Note: As in CSS, you can ommit quotes for your strings as long as they don’t contain any special characters. So `$list: item-1, item-2, item-3` is perfectly valid._

**You can nest lists.** As for JavaScript or any other language, there is no limit regarding the level of depth you can have with nested lists. Just go as deep as you need to, bro.

```scss
/* Nested lists with braces and same separator */
$list: (
   ('item-1.1', 'item-1.2', 'item-1.3'),
   ('item-2.1', 'item-2.2', 'item-2.3'),
   ('item-3.1', 'item-3.2', 'item-3.3')
);

/* Nested lists without braces using different separators to distinguish levels */
$list: 'item-1.1' 'item-1.2' 'item-1.3', 'item-2.1' 'item-2.2' 'item-2.3',
  'item-3.1' 'item-3.2' 'item-3.3';
```

**You can ommit parentheses** (as you can guess from the previous example). You can define a non-empty list without any parentheses if you feel so. This is because -contrarily to what most people think- [parentheses are not what create lists](https://github.com/nex3/sass/issues/837#issuecomment-20429965) in Sass (except when empty); it is the delimiter (see below). Braces are a just a grouping mecanism.

_Note: This is the theory. I’ve noticed braces are not just a grouping mecanism. When manipulating matrices (4/5+ levels of nesting), braces are definitely not optional. This is too complicated for today though, we’ll dig into this in another blog post._

> Manipulating 5+ nested lists is a pain in the ass.

```scss
$list: 'item-1', 'item-2', 'item-3';
```

**Indexes start at 1, not 0.** This is one of the most disturbing once you start experimenting with Sass lists. <span style="text-decoration: line-through">Plus it makes a lot of things pretty complicated (cf CSS-Tricks article).</span> _No, it doesn’t._

```scss
nth($list, 0) -> throws error
nth($list, 1) -> “item-1”
```

**Every value in Sass is treated as a ~~list~~ _one-element list_.** Strings, numbers, boolean, whatever you can put in a variable. This means you’re fine to use some list functions even on things that don’t look like one.

```scss
$variable: "Sass is awesome";
length($variable) -> 1
```

_Beware! If you remove the quotes around this string, it will be parsed as a 3-items long list (1: Sass; 2: is; 3: awesome). I recommand you quotes your strings to avoid some unpleasant surprises._

## Sass list functions

Before getting into the real topic, let’s make a round-up on Sass list functions.

**`length($list)`**: returns the length of `$list`.

**`nth($list, $index)`**: returns the value at `$index` position in `$list` (throw an error if index is greater than the list length).

**`index($list, $value)`**: returns the first index of `$value` in `$list` (or `null`).

**`append($list, $value[, $separator])`**: appends `$value` to the end of `$list` using `$separator` as a separator (using the current one if not specified).

**`join($list-1, $list-2[, $separator])`**: appends `$list-2` to `$list-1` using `$separator` as a separator (using the one from the first list if not specified).

**`zip(*$lists)`**: combines several list into a comma-separated list where the nth value is a space-separated lists of all source lists nth values. In case source lists are not all the same length, the result list will be the length of the shortest one.

## Adding things to Sass lists

This is where things get very interesting. And quite complicated as well. I think the best way to explain this kind of stuff is to use an example. I’ll use the same I talked about in [my Sass talk at KiwiParty](/2013/07/01/feedbacks-kiwiparty/) last month.

Please consider an extended selector like:

```css
.home .nav-home,
.about .nav-about,
.products .nav-products,
.contact .nav-contact {
}
```

…based on a list of keywords `$pages: ('home', 'about', 'products', 'contact')`. I found 3 ways to generate this selector based on the list; we’ll see them one by one.

But first, we will write the skeleton of our testcase:

```scss
$pages: (
  'home',
  'about',
  'products',
  'contact'
);
$selector: ();

@each $item in $pages {
  /* We create `$selector` */
}

#{$selector} {
  style: awesome;
}
```

### The long and dirty way

This is the method I was still using a couple of weeks ago. It works but it involves an extra conditional statement to handle commas _(also it’s ugly)_. Please see below.

```scss
@each $item in $pages {
  $selector: $selector unquote('.#{$item} .nav-#{$item}');

  // Add comma if not dealing with the last item of list
  @if $item != nth($pages, length($pages)) {
    $selector: $selector unquote(',');
  }
}
```

Basically, we add the new selector to `$selector` and if we are not dealing with the last item of the list, we add a comma.

_Note: we have to use `unquote('')` to treat our new selector as an unquoted string._

### The clean way

This one is the cleanest way you can use between the three; not the shortest though. Anyway, it uses `append(..)` properly.

```scss
@each $item in $pages {
  $selector: append($selector, unquote('.#{$item} .nav-#{$item}'), 'comma');
}
```

I think this is pretty straightforward: we append to `$selector` the new selector by explicitly separating it from the previous one with a comma.

### The implicit way

<span style="text-decoration: line-through">Probably my favorite version above all since it’s the shortest.</span> It relies on implicit appending; <span style="text-decoration: line-through">very neat.</span> _so I highly recommend you to use the `append(..)` way._

```scss
@each $item in $pages {
  $selector: $selector, unquote('.#{$item} .nav-#{$item}');
}
```

Instead of using `append(..)` and setting the 3rd parameter to `comma` we implicitly do it via removing the function and using a comma right after `$selector`.

## Final words

> Having a very permissive syntax can be complicated.

The three versions we saw in the previous section work like a charm, <span style="text-decoration: line-through">the one you should use is really up to you</span> _although the one with `append(..)` is definitely the cleaner way of handling this. You can also do it in some other more complicated and dirty ways._

Anyway, this shows why having a very permissive syntax can be complicated. As I said at the beginning of this post, you can do pretty much whatever you want and if you want my opinion this isn’t for the best.
