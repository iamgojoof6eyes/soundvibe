# 📡 SoundVibe — API & Endpoint Reference

Comprehensive documentation of all backend Express REST API routes and client Firestore service interfaces in **SoundVibe**.

---

## 🔍 Discovery & Search API

### `GET /api/search`
Unified multi-category search across tracks, users, posts, and hashtag vibe tags.

#### Query Parameters:
| Param | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `q` | `string` | `""` | Search keyword (artist, song title, `@username`, lyric, or tag) |
| `type` | `string` | `'all'` | Category filter: `'all'`, `'songs'`, `'users'`, `'posts'`, `'tags'` |
| `limit` | `number` | `25` | Maximum number of records per category |

#### Response (`200 OK`):
```json
{
  "query": "tame",
  "type": "all",
  "tracks": [
    {
      "id": "itunes-1827093360",
      "title": "End Of Summer",
      "artist": "Tame Impala",
      "album": "End Of Summer - Single",
      "artwork": "https://is1-ssl.mzstatic.com/image/.../600x600bb.jpg",
      "previewUrl": "https://audio-ssl.itunes.apple.com/...",
      "genre": "Alternative",
      "durationMs": 432566
    }
  ],
  "users": [
    {
      "id": "user-tame-curator",
      "name": "Aria Stone",
      "username": "ariastone",
      "bio": "Obsessed with psychedelic soundscapes 🎸",
      "avatar": "https://api.dicebear.com/7.x/bottts/svg?seed=ariastone",
      "followers": ["user-1"],
      "following": ["user-2"]
    }
  ],
  "posts": [],
  "tags": [
    { "tag": "#psychedelic", "count": 12 }
  ]
}
```

---

### `GET /api/music/search`
Search songs directly from Apple iTunes Catalog with 30s previews.

#### Query Parameters:
- `q`: Track or artist title

#### Response (`200 OK`):
```json
{
  "results": [
    {
      "id": "itunes-101",
      "title": "The Less I Know The Better",
      "artist": "Tame Impala",
      "album": "Currents",
      "artwork": "https://...",
      "previewUrl": "https://...",
      "genre": "Psychedelic Pop"
    }
  ]
}
```

---

## 📝 Posts & Reviews API

### `GET /api/posts`
Fetch posts with optional filtering.

#### Query Parameters:
- `filter`: `'all'`, `'following'`, `'trending'`, `'top_rated'`
- `genre`: e.g. `'Indie Rock'`
- `userId`: Filter posts created by a specific user

---

### `POST /api/posts`
Create a new music vibe review.

#### Request Body:
```json
{
  "track": {
    "title": "Kyoto",
    "artist": "Phoebe Bridgers",
    "album": "Punisher",
    "artwork": "https://...",
    "previewUrl": "https://...",
    "genre": "Indie Rock"
  },
  "rating": 5,
  "mood": "Melancholic Bliss",
  "headline": "A poetic anthem for travelling minds",
  "review": "The brass section in the chorus hits with bittersweet perfection.",
  "favoriteLyric": "I'm gonna kill you / If you don't beat me to it",
  "vibeTags": ["#indieRock", "#lyricGenius"],
  "username": "jatin",
  "userId": "user-123"
}
```

---

### `POST /api/posts/:postId/comments`
Add a comment to a review thread.

#### Request Body:
```json
{
  "text": "Completely agree with this review!",
  "username": "jatin",
  "authorName": "Jatin",
  "authorAvatar": "https://...",
  "userId": "user-123"
}
```

---

### `PUT /api/posts/:postId/comments/:commentId`
Edit an existing comment.

#### Request Body:
```json
{
  "text": "Updated comment text"
}
```

---

### `DELETE /api/posts/:postId/comments/:commentId`
Delete a comment from a review thread.

---

## 👥 Users & Community Network API

### `GET /api/users/:id/followers`
Retrieve list of followers for a user.

### `GET /api/users/:id/following`
Retrieve list of users followed by the user.

### `POST /api/users/:id/follow`
Toggle follow/unfollow status between the authenticated user and target user.
