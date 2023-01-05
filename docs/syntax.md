# The Syntax of *Cuiping Formula*

English | [简体中文](./syntax.zh-Hans.md)

*Cuiping Formulas* are used for describing *Chemical Structures* exactly

## Group

A *Chemical Structure* starts with a *Group*. A *Group* can:

- Include uppercase and lowercase characters, lowercase characters following uppercase characters will be merged into one font box (to make element notation more natural)
- Include digits, digits will be rendered as subscript
- Be an isolated *Wildcard `?`*, and will not be rendered (to express a substituent)
- Be an isolated *Collapsed Carbon Atom `.`*, and will not be rendered, connected bonds will be rendered without gaps

A *Group* can include *In-group Typesetting*:

- Using `^`/`_`/`` ` `` to turn the following character into superscript/subscript/normal text
- When `^`/`_`/`` ` `` is followed by characters wrapped by `{}`, turning the wrapped characters into superscript/subscript/normal text
- Superscripts and subscripts have no character limit

## Attribute

A *Group* can be followed by an *Attributes Set*:

- An *Attributes Set* should be wrapped by `{}`
- An *Attributes Set* must include at least one *Attribute*. *Attributes* are split by `,` (Dangling `,` is allowed)

*Attributes* can be divided into string type, integer type, float type, and boolean (switch) type

- A string-typed, integer-typed or float-typed *Attribute* should contain an *Attribute Name* and an *Attribute Value*. They should be split by `:`
- An integer-typed/float-typed *Attribute* must have an *Attribute Value* of integer/float
- A boolean-typed *Attribute* should only contain an *Attribute Name*
- [Supported *Attributes* List](#attributes-list)

## Bond

A *Group* can be followed by *Bonds* (if the *Group* is followed by an *Attributes Set*, the *Bonds* should follow the *Attributes Set*):

- Followed by more than one *Bond*, together these *Bonds* are called *Bonds Set*, they should be wrapped by `[]` and split by `,` (Dangling `,` is allowed)
- Followed by a single *Bond*
- The single *Bond* and the *Bonds Set* can co-exist, in this case, the single *Bond* should follow the *Bonds Set*

Rules of expressing a *Bond*:
- A *Bond* consists of its *Bond Type* and *Chemical Structure* connected to it
- *Bond Type* describes the count and the direction of a *Bond*, specifically, *Bond Direction* should be written after *Bond Count*
- *Bond Type* can start with *Bond Modifiers*

*Bond Count*:

- `=` stands for a double bond; `#` stands for a triple bond
- A single bond by default

*Bond Directions* have a similar expressing method to writing chemical structure:

- Using `-`, `|`, `/` and `\` to represent a *Bond* of 0°, 90°, 60° and 270° respectively
- *Bond Directions* can be `+`, see [Overlapping](#bond-overlapping) for details
- If *Bond Type* appears before the *Chemical Structure* it connected, the direction will follow the rules stated above; if *Bond Type* appears after the *Chemical Structure* it connected, the direction will be the opposite (i.e. adding a deflection of 180°)
- If *Bond Type* appears after the *Chemical Structure* it connected, the *Bond* can only appear in a *Bonds Set*
- *Bond Direction* must not be duplicated (bonds in), and must be unique from the direction of the *Bond* that it is connected from the *Group* it belongs to

*Bond Modifier*:

- *Bond Modifier `*`* sets the length (`length` *Attribute*) of the *Bond* to 0
- *Bond Modifier `!`* can make all the following *Bond Directions* add a deflection of 180° (to express opposite *Bonds* outsides the *Bonds Set*)
- *Bond Modifier `~`* acts on all *Bond Directions* of `/` and `\` in the following *Bond Directions*. It can make their angle with x-axis change from 60° to 30°

Shorthand rules for *Bond Directions*:

- If *Bond Count* exists, omitting *Bond Direction* is allowed, in this case, *Bond Direction* will be 0° by default
- If *Bond Modifier `!`* exists, omitting *Bond Count* and *Bond Direction* is allowed, in this case, *Bond Direction* will be 180° by default

## Bond Overlapping

Overlapping more than one *Bond Direction* is allowed to express connecting to the same *Chemical Structure*:

- A *Bond Direction* of `+` stands for four simultaneous *Bond Directions* of up, down, left and right direction
- The same *Bond Direction* is allowed to appear twice while overlapping, in this case, the direction will automatically reverse the second time it appears
- If a *Bond Direction* and the first *Bond Direction* are symmetrical about the x-axis/y-axis, all the *Bonds* in the *Chemical Structure* connected to the former will be flipped by the x-axis/y-axis (however, the texts in the *Groups* in it will not be rotated)
- All *Bonds* in *Chemical Structure* connected by other *Bond Direction* will be rotated by the same angle as the angle between their *Bond Direction* and the first *Bond Direction*

## Referencing

*Referencing* can be used to separate complicated *Chemical Structures* into parts to express

- A *Chemical Structure* can be named by using *Attribute* `ref`, a named *Chemical Structure* is referenceable
- A sign `&` followed by a referenced name is a *Referencing*, as well as a *Group*, it can be followed by *Bonds*
- Using `;` to separate different *Chemical Structures*. (Dangling `;` is allowed) Ultimately, these *Chemical Structures* must be fully connected by *Referencing*
- A *Referencing* cannot be connected to itself by a *Bond* (i.e., self-loops are not allowed)

## Attributes List

*Group* Attributes:

| Attribute Name | Alias | Type    | Usage                       |
| :------------- | :---- | :------ | :-------------------------- |
| `color`        | `C`   | String  | To specify the text's color |
| `bold`         | `B`   | Boolean | To bold the text            |
| `ref`          | `&`   | String  | To name the reference       |

*Bond* Attributes:

| Attribute Name | Alias     | Type              | Usage
| :------------- | :-------- | :---------------- | :----
| `color`        | `C`       | String            | To specify the bond's color
| `highEnergy`   | `HE`, `~` | Boolean           | To describe a high-energy bond
| `from`         | `<`       | Boolean / Integer | Coordinate bond came from along the bond, an integer can specify the number of arrows
| `to`           | `>`       | Boolean / Integer | Coordinate bond came to along the bond, an integer can specify the number of arrows
| `length`       | `L`       | Float             | To specify the bond's length (multiple of unit length, 1 by default)

## Form

```
cuiping         = <struct> (; <struct>)*
struct          = <chem struct> | <ref struct>
bond list       = (<bonds>)? | (<bond>)?
chem struct     = <group> <bond list>
ref struct      = & <identifier> <bond list>
bonds           = [ <bond> (, <bond>)* ]
bond            = <pre bond> | <post bond>
pre bond        = <bond type> <struct>
post bond       = <struct> <bond type>
bond type       = (<bond count> <bond dir> | <bond count> | <bond dir>)
                | (<bond modifier> (<bond count>)? (<bond dir>)?)
bond count      = '=' | '#'
bond dir        = ('+' | '-' | '/' | '\' | '|')+
bond modifier   = '!' | '*'
group           = <group> ((<group char>)+ | <group typeset>)
group typeset   = ('^' | '_')(<any char> | '{' (<any char>)+ '}')
identifier      = <any letter> | <any number>
group char      = <identifier> | '(' | ')' | '.' | '?'
```
