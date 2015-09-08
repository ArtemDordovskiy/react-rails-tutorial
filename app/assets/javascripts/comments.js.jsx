/**
 * This file provided by Facebook is for non-commercial testing and evaluation
 * purposes only. Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var Comment = React.createClass({
  render() {
    var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
    return (
      <div className="comment">
        <h2 className="commentAuthor">
          {this.props.author}
        </h2>
        <span dangerouslySetInnerHTML={{__html: rawMarkup}} />
      </div>
    );
  }
});

var CommentBox = React.createClass({
  loadCommentsFromServer() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: (data) => {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleCommentSubmit(comment) {
    var comments = this.state.data;
    var newComments = comments.concat([comment]);
    this.setState({data: newComments});
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: { comment: comment },
      success: (data) => {
        this.setState({data: data});
      }.bind(this),
      error: (xhr, status, err) => {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState() {
    return {data: []};
  },
  componentDidMount() {
    this.loadCommentsFromServer();
    setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  },
  render() {
    return (
      <div className="commentBox">
        <h1>Comments</h1>
        <CommentList data={this.state.data} />
        <CommentForm onCommentSubmit={this.handleCommentSubmit.bind(this)} />
      </div>
     );
  }
});

var CommentList = React.createClass({
  render: function() {
    var commentNodes = this.props.data.map(function(comment, index) {
      return (
          // `key` is a React-specific concept and is not mandatory for the
          // purpose of this tutorial. if you're curious, see more here:
          // http://facebook.github.io/react/docs/multiple-components.html#dynamic-children
        <Comment author={comment.author} key={index}>
          {comment.text}
        </Comment>
       );
    });
    return (
      <div className="commentList">
        {commentNodes}
      </div>
    );
  }
});

var CommentForm = React.createClass({
  handleSubmit: function(e) {
    e.preventDefault();
    var author = React.findDOMNode(this.refs.author).value.trim();
    var text = React.findDOMNode(this.refs.text).value.trim();
    if (!text || !author) {
      return;
    }
    this.props.onCommentSubmit({author: author, text: text});
    React.findDOMNode(this.refs.author).value = '';
    React.findDOMNode(this.refs.text).value = '';
  },
  render: function() {
    return (
      <form onSubmit={this.handleSubmit}>
        <div className="form-group">
          <label for="author">Author</label>
          <input type="text" placeholder="Your name" ref="author" className="form-control" id="author" />
        </div>
        <div className="form-group">
          <label for="description">Text</label>
          <input type="text" placeholder="Say something..." ref="text" className="form-control" id="description" />
        </div>
        <input type="submit" value="Post" className="btn btn-default" />
      </form>
    );
  }
});

React.render(
  <CommentBox url="comments.json" pollInterval={2000} />,
  document.getElementById('content')
);
